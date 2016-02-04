//
//  Copyright (c) 2016 Google Inc.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
//

#import "AppState.h"
#import "Constants.h"
#import "FirebaseAuth/FIRAuth.h"
#import "FCViewController.h"

@import FirebaseDatabase;
@import Firebase.AdMob;
@import Firebase.AppInvite;
@import Firebase.Config;
@import Firebase.Core;
@import Firebase.CrashReporting;
@import Firebase.SignIn;

@interface FCViewController ()<UITableViewDataSource, UITableViewDelegate,
    UITextFieldDelegate, GINInviteDelegate>

@property(nonatomic, weak) IBOutlet UITextField *textField;
@property(nonatomic, weak) IBOutlet UIButton *sendButton;

@property(nonatomic, weak) IBOutlet GADBannerView *banner;
@property(nonatomic, weak) IBOutlet UITableView *clientTable;

@end

@implementation FCViewController

Firebase *ref;
NSMutableArray<FDataSnapshot *> *messages;
int msglength = 10;
FirebaseHandle _refHandle;
UInt32 userInt;

-(id) init
{
  self = [super init];
  if(self)
  {
    messages = @[];
    userInt = arc4random();
  }
  return self;
}

- (IBAction)didSendMessage:(UIButton *)sender {
  [self textFieldShouldReturn:_textField];
}

- (IBAction)didInvite:(UIButton *)sender {
  id<GINInviteBuilder> invite = [GINInvite inviteDialog];
  [invite setMessage:@"Message"];
  [invite setTitle:@"Title"];
  [invite setDeepLink:@"/invite"];

  [invite open];
}

- (IBAction)didPressCrash:(id)sender {
  FCRLog(NO, @"Cause Crash button clicked");
  assert(NO);
}

- (void)inviteFinishedWithInvitations:(NSArray *)invitationIds error:(NSError *)error {
  if (error) {
    NSLog(@"Failed: %@", error.localizedDescription);
  } else {
    NSLog(@"Invitations sent");
  }
}

- (void)viewDidLoad {
  [super viewDidLoad];
  [[NSNotificationCenter defaultCenter] addObserver:self selector: @selector(showReceivedMessage:)
                                               name:NotificationKeysMessage object: nil];

  ref = [[Firebase alloc] initWithUrl:[FIRContext sharedInstance].serviceInfo.databaseURL];
  [self loadAd];
  [_clientTable registerClass:UITableViewCell.self forCellReuseIdentifier:@"tableViewCell"];
  [self fetchConfig];

  // Log that the view did load, true is used here so the log message will be
  // shown in the console output. If false is used the message is not shown in
  // the console output.
  FCRLog(YES, @"View loaded");
}

- (void)loadAd {
  self.banner.adUnitID = [FIRContext sharedInstance].adUnitIDForBannerTest;
  self.banner.rootViewController = self;
  [self.banner loadRequest:[GADRequest request]];
}

- (void)fetchConfig {
  RCNDefaultConfigCompletion completion = ^void(RCNConfig *config, RCNConfigStatus status, NSError *error) {
    if (error) {
      // There has been an error fetching the config
      NSLog(@"Error fetching config: %@", error.localizedDescription);
    } else {
      // Parse your config data
      msglength = [config numberForKey:@"friendly_msg_length" defaultValue:[NSNumber numberWithInt:10]];
      NSLog(@"Friendly msg length config: %d", msglength);
    }
  };

  NSDictionary *customVariables = @{@"build": @"dev"};
  // 43200 secs = 12 hours
  [RCNConfig fetchDefaultConfigWithExpirationDuration:43200
                                      customVariables:customVariables
                                    completionHandler:completion];

}

- (BOOL)textField:(UITextField *)textField shouldChangeCharactersInRange:(NSRange)range replacementString:(nonnull NSString *)string {
  NSString *text = textField.text;
  if (!text) {
    return YES;
  }
  long newLength = text.length + string.length - range.length;
  return (newLength <= msglength);
}

- (void)viewWillAppear:(BOOL)animated {
  [messages removeAllObjects];
  // Listen for new messages in the Firebase database
  _refHandle = [[ref childByAppendingPath:@"messages"] observeEventType:FEventTypeChildAdded withBlock:^(FDataSnapshot *snapshot) {
    [messages addObject:snapshot];
    [_clientTable insertRowsAtIndexPaths:[NSIndexPath indexPathForRow:messages.count-1 inSection:0] withRowAnimation: UITableViewRowAnimationAutomatic];

  }];
}

- (void)viewWillDisappear:(BOOL)animated {
  [ref removeObserverWithHandle:_refHandle];
}

// UITableViewDataSource protocol methods
- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
  return [messages count];
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(nonnull NSIndexPath *)indexPath {
  // Dequeue cell
  UITableViewCell *cell = [_clientTable dequeueReusableCellWithIdentifier:@"tableViewCell" forIndexPath:indexPath];

  // Unpack message from Firebase DataSnapshot
  FDataSnapshot *messageSnapshot = messages[indexPath.row];
  NSDictionary<NSString *, NSString *> *message = messageSnapshot.value;
  NSString *name = message[MessageFieldsname];
  NSString *text = message[MessageFieldstext];
  cell.textLabel.text = [NSString stringWithFormat:@"%@: %@", name, text];
  cell.imageView.image = [UIImage imageNamed: @"ic_account_circle"];
  NSString *photoUrl = message[MessageFieldsphotoUrl];
  if (photoUrl) {
    NSURL *url = [NSURL URLWithString:photoUrl];
    if (url) {
      NSData *data = [NSData dataWithContentsOfURL:url];
      if (data) {
        cell.imageView.image = [UIImage imageWithData:data];
      }
    }
  }

  return cell;
}

// UITextViewDelegate protocol methods
- (BOOL)textFieldShouldReturn:(UITextField *)textField {
  NSMutableDictionary *data = @{MessageFieldstext: textField.text,
                         MessageFieldsname: [NSString stringWithFormat:@"User%d", userInt]};
  NSString *user = [AppState sharedInstance].displayName;
  if (user) {
    data[MessageFieldsname] = user;
  }
  NSURL *photoUrl = AppState.sharedInstance.photoUrl;
  if (photoUrl) {
    data[MessageFieldsphotoUrl] = [photoUrl absoluteString];
  }

  // Push data to Firebase Database
  [[[ref childByAppendingPath:@"messages"] childByAutoId] setValue:data];
  textField.text = @"";
  return YES;
}

- (void)showReceivedMessage:(NSNotification *)notification {
  NSDictionary *info = notification.userInfo;
  if (info) {
    NSDictionary *aps = info[@"aps"];
    if (aps) {
      [self showAlert:@"Message received" message:aps[@"alert"]];
    }
  } else {
    NSLog(@"Software failure. Guru meditation.");
  }
}

- (IBAction)signOut:(UIButton *)sender {
  FIRAuth *firebaseAuth = [FIRAuth auth];
  [firebaseAuth signOut];
  [AppState sharedInstance].signedIn = false;
  [self performSegueWithIdentifier:SeguesFpToSignIn sender:nil];
}

- (void)showAlert:(NSString *)title message:(NSString *)message {
  dispatch_async(dispatch_get_main_queue(), ^{
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:title message:message preferredStyle:UIAlertControllerStyleAlert];
    UIAlertAction *dismissAction = [UIAlertAction actionWithTitle:@"Dismiss" style:UIAlertActionStyleDestructive handler:nil];
    [alert addAction:dismissAction];
    [self presentViewController:alert animated: true completion: nil];
  });
}

- (void)guruMeditation {
  NSString *error = @"Software failure. Guru meditation.";
  [self showAlert:@"Error" message: error];
  NSLog(error);
}

@end
