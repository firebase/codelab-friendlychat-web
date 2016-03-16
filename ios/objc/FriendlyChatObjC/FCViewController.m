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

@import Photos;
#import "AppState.h"
#import "Constants.h"
#import "FCViewController.h"

#import "FirebaseStorage.h"
#import "FIRRemoteConfig.h"
#import "FCRLog.h"
@import FirebaseDatabase;
@import FirebaseApp;
@import FirebaseAuth;
@import Firebase.AdMob;
@import Firebase.Core;

@interface FCViewController ()<UITableViewDataSource, UITableViewDelegate,
UITextFieldDelegate, UIImagePickerControllerDelegate, UINavigationControllerDelegate> {
  int _msglength;
  FirebaseHandle _refHandle;
}

@property(nonatomic, weak) IBOutlet UITextField *textField;
@property(nonatomic, weak) IBOutlet UIButton *sendButton;

@property(nonatomic, weak) IBOutlet GADBannerView *banner;
@property(nonatomic, weak) IBOutlet UITableView *clientTable;

@property (strong, nonatomic) FIRDatabaseReference *ref;
@property (strong, nonatomic) NSMutableArray<FIRDataSnapshot *> *messages;
@property (strong, nonatomic) FIRStorageReference *storageRef;
@property (nonatomic, strong) FIRRemoteConfig *remoteConfig;

@end

@implementation FCViewController

- (IBAction)didSendMessage:(UIButton *)sender {
  [self textFieldShouldReturn:_textField];
}

- (IBAction)didPressCrash:(id)sender {
  FCRLog(@"Cause Crash button clicked");
  assert(NO);
}

- (IBAction)didPressFreshConfig:(id)sender {
  [self fetchConfig];
}

- (void)viewDidLoad {
  [super viewDidLoad];

  _ref = [FIRDatabase database].reference;

  _remoteConfig = [FIRRemoteConfig remoteConfig];
  // Create Remote Config Setting to enable developer mode.
  // Fetching configs from the server is normally limited to 5 requests per hour.
  // Enabling developer mode allows many more requests to be made per hour, so developers
  // can test different config values during development.
  FIRRemoteConfigSettings *remoteConfigSettings = [[FIRRemoteConfigSettings alloc] init];
  remoteConfigSettings.developerModeEnabled = YES;
  _remoteConfig.configSettings = remoteConfigSettings;

  _msglength = 10;
  _messages = [[NSMutableArray alloc] init];

  [self loadAd];
  [_clientTable registerClass:UITableViewCell.self forCellReuseIdentifier:@"tableViewCell"];
  [self fetchConfig];
  [self configureStorage];

  // Log that the view did load, FCRNSLog is used here so the log message will be
  // shown in the console output. If FCRLog is used the message is not shown in
  // the console output.
  FCRNSLog(@"View loaded");
}

- (void)loadAd {
  self.banner.adUnitID = [FIRContext sharedInstance].adUnitIDForBannerTest;
  self.banner.rootViewController = self;
  [self.banner loadRequest:[GADRequest request]];
}

- (void)fetchConfig {
  long expirationDuration = 3600;
  // If in developer mode cacheExpiration is set to 0 so each fetch will retrieve values from
  // the server.
  if (self.remoteConfig.configSettings.developerModeEnabled) {
    expirationDuration = 0;
  }

  // cacheExpirationSeconds is set to cacheExpiration here, indicating that any previously
  // fetched and cached config would be considered expired because it would have been fetched
  // more than cacheExpiration seconds ago. Thus the next fetch would go to the server unless
  // throttling is in progress. The default expiration duration is 43200 (12 hours).
  [self.remoteConfig fetchWithExpirationDuration:expirationDuration completionHandler:^(FIRRemoteConfigFetchStatus status, NSError *error) {
    if (status == FIRRemoteConfigFetchStatusSuccess) {
      NSLog(@"Config fetched!");
      [_remoteConfig activateFetched];
      _msglength = _remoteConfig[@"friendly_msg_length"].numberValue.intValue;
      NSLog(@"Friendly msg length config: %d", _msglength);
    } else {
      NSLog(@"Config not fetched");
      NSLog(@"Error %@", error);
    }
  }];
}

- (void)configureStorage {
  FIRFirebaseApp *app = [FIRFirebaseApp app];
  self.storageRef = [[FIRStorage storageForApp:app] reference];
}

- (BOOL)textField:(UITextField *)textField shouldChangeCharactersInRange:(NSRange)range replacementString:(nonnull NSString *)string {
  NSString *text = textField.text;
  if (!text) {
    return YES;
  }
  long newLength = text.length + string.length - range.length;
  return (newLength <= _msglength);
}

- (void)viewWillAppear:(BOOL)animated {
  [_messages removeAllObjects];
  // Listen for new messages in the Firebase database
  _refHandle = [[_ref childByAppendingPath:@"messages"] observeEventType:FIRDataEventTypeChildAdded withBlock:^(FIRDataSnapshot *snapshot) {
    [_messages addObject:snapshot];
    [_clientTable insertRowsAtIndexPaths:@[[NSIndexPath indexPathForRow:_messages.count-1 inSection:0]] withRowAnimation: UITableViewRowAnimationAutomatic];
  }];
}

- (void)viewWillDisappear:(BOOL)animated {
  [_ref removeObserverWithHandle:_refHandle];
}

// UITableViewDataSource protocol methods
- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
  return [_messages count];
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(nonnull NSIndexPath *)indexPath {
  // Dequeue cell
  UITableViewCell *cell = [_clientTable dequeueReusableCellWithIdentifier:@"tableViewCell" forIndexPath:indexPath];

  // Unpack message from Firebase DataSnapshot
  FIRDataSnapshot *messageSnapshot = _messages[indexPath.row];
  NSDictionary<NSString *, NSString *> *message = messageSnapshot.value;
  NSString *name = message[MessageFieldsname];
  NSString *imageUrl = message[MessageFieldsimageUrl];
  if (imageUrl) {
    [[_storageRef childByAppendingPath:imageUrl] dataWithCompletion:^(NSData *data, NSError *error) {
      if (error) {
        NSLog(@"Error downloading: %@", error);
        return;
      }
      cell.imageView.image = [UIImage imageWithData:data];
    }];
    cell.textLabel.text = [NSString stringWithFormat:@"sent by: %@", name];
  } else {
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
  }
  return cell;
}

// UITextViewDelegate protocol methods
- (BOOL)textFieldShouldReturn:(UITextField *)textField {
  [self sendMessage:@{MessageFieldstext: textField.text}];
  textField.text = @"";
  return YES;
}

- (void)sendMessage:(NSDictionary *)data {
  NSMutableDictionary *mdata = [data mutableCopy];
  mdata[MessageFieldsname] = [AppState sharedInstance].displayName;
  NSURL *photoUrl = AppState.sharedInstance.photoUrl;
  if (photoUrl) {
    mdata[MessageFieldsphotoUrl] = [photoUrl absoluteString];
  }

  // Push data to Firebase Database
  [[[_ref childByAppendingPath:@"messages"] childByAutoId] setValue:mdata];
}

# pragma mark - Image Picker

- (IBAction)didTapAddPhoto:(id)sender {
  UIImagePickerController * picker = [[UIImagePickerController alloc] init];
  picker.delegate = self;
  if ([UIImagePickerController isSourceTypeAvailable:UIImagePickerControllerSourceTypeCamera]) {
    picker.sourceType = UIImagePickerControllerSourceTypeCamera;
  } else {
    picker.sourceType = UIImagePickerControllerSourceTypePhotoLibrary;
  }

  [self presentViewController:picker animated:YES completion:NULL];
}

- (void)imagePickerController:(UIImagePickerController *)picker
didFinishPickingMediaWithInfo:(NSDictionary *)info {
  [picker dismissViewControllerAnimated:YES completion:NULL];

  NSURL *referenceUrl = info[UIImagePickerControllerReferenceURL];
  PHFetchResult* assets = [PHAsset fetchAssetsWithALAssetURLs:@[referenceUrl] options:nil];
  PHAsset *asset = [assets firstObject];
  [asset requestContentEditingInputWithOptions:nil
                             completionHandler:^(PHContentEditingInput *contentEditingInput, NSDictionary *info) {
                               NSString *imageFile = [contentEditingInput.fullSizeImageURL absoluteString];
                               NSString *fileName = [[AppState sharedInstance].displayName stringByAppendingString:[referenceUrl lastPathComponent]];
                               FIRStorageMetadata *metadata = [FIRStorageMetadata new];
                               metadata.contentType = @"image/jpeg";
                               [[_storageRef childByAppendingPath:fileName]
                                                          putFile:imageFile metadata:metadata
                                                   withCompletion:^(FIRStorageMetadata *metadata, NSError *error) {
                                                     if (error) {
                                                       NSLog(@"Error uploading: %@", error);
                                                       return;
                                                     }
                                                     [self sendMessage:@{MessageFieldsimageUrl: fileName}];
                                                   }
                                ];
                             }];
}

- (void)imagePickerControllerDidCancel:(UIImagePickerController *)picker {
  [picker dismissViewControllerAnimated:YES completion:NULL];
}

- (IBAction)signOut:(UIButton *)sender {
  FIRAuth *firebaseAuth = [FIRAuth auth];
  NSError *signOutError;
  BOOL status = [firebaseAuth signOut:&signOutError];
  if (!status) {
    NSLog(@"Error signing out: %@", signOutError);
    return;
  }
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

@end
