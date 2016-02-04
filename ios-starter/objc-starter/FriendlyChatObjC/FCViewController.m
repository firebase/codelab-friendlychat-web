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
NSArray<FDataSnapshot *> *messages;
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
}

- (IBAction)didPressCrash:(id)sender {
}

- (void)inviteFinishedWithInvitations:(NSArray *)invitationIds error:(NSError *)error {
}

- (void)viewDidLoad {
  [super viewDidLoad];
  [[NSNotificationCenter defaultCenter] addObserver:self selector: @selector(showReceivedMessage:)
                                               name:NotificationKeysMessage object: nil];

  ref = [[Firebase alloc] initWithUrl:[FIRContext sharedInstance].serviceInfo.databaseURL];
  [self loadAd];
  [_clientTable registerClass:UITableViewCell.self forCellReuseIdentifier:@"tableViewCell"];
  [self fetchConfig];
}

- (void)loadAd {
}

- (void)fetchConfig {
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
}

- (void)viewWillDisappear:(BOOL)animated {
}

// UITableViewDataSource protocol methods
- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
  return [messages count];
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(nonnull NSIndexPath *)indexPath {
  // Dequeue cell
  UITableViewCell *cell = [_clientTable dequeueReusableCellWithIdentifier:@"tableViewCell" forIndexPath:indexPath];
  return cell;
}

// UITextViewDelegate protocol methods
- (BOOL)textFieldShouldReturn:(UITextField *)textField {
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
