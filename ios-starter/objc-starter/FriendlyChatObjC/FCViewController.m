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
#import "FCViewController.h"

#import "FirebaseStorage.h"
@import FirebaseDatabase;
@import FirebaseApp;
@import FirebaseAuth;
@import Firebase.AdMob;
@import Firebase.Config;
@import Firebase.Core;
@import Firebase.CrashReporting;

@interface FCViewController ()<UITableViewDataSource, UITableViewDelegate,
UITextFieldDelegate, UIImagePickerControllerDelegate, UINavigationControllerDelegate> {
  int _msglength;
  FirebaseHandle _refHandle;
}

@property(nonatomic, weak) IBOutlet UITextField *textField;
@property(nonatomic, weak) IBOutlet UIButton *sendButton;

@property(nonatomic, weak) IBOutlet GADBannerView *banner;
@property(nonatomic, weak) IBOutlet UITableView *clientTable;

@property (strong, nonatomic) Firebase *ref;
@property (strong, nonatomic) NSMutableArray<FDataSnapshot *> *messages;
@property (strong, nonatomic) FIRStorage *storageRef;

@end

@implementation FCViewController

- (IBAction)didSendMessage:(UIButton *)sender {
  [self textFieldShouldReturn:_textField];
}

- (IBAction)didPressCrash:(id)sender {
  assert(NO);
}

- (IBAction)didPressFreshConfig:(id)sender {
  [self fetchConfig];
}

- (void)viewDidLoad {
  [super viewDidLoad];

  _msglength = 10;
  _messages = [[NSMutableArray alloc] init];

  [self loadAd];
  [_clientTable registerClass:UITableViewCell.self forCellReuseIdentifier:@"tableViewCell"];
  [self fetchConfig];
  [self configureStorage];
}

- (void)loadAd {
}

- (void)fetchConfig {
}

- (void)configureStorage {
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
}

- (void)viewWillDisappear:(BOOL)animated {
}

// UITableViewDataSource protocol methods
- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
  return 0;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(nonnull NSIndexPath *)indexPath {
  // Dequeue cell
  UITableViewCell *cell = [_clientTable dequeueReusableCellWithIdentifier:@"tableViewCell" forIndexPath:indexPath];

  return cell;
}

// UITextViewDelegate protocol methods
- (BOOL)textFieldShouldReturn:(UITextField *)textField {
  NSMutableDictionary *data = [[NSMutableDictionary alloc] init];
  data[MessageFieldstext] = textField.text;
  [self sendMessage:data];
  textField.text = @"";
  return YES;
}

- (void)sendMessage:(NSDictionary *)data {
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
                             }
   ];
}

- (void)imagePickerControllerDidCancel:(UIImagePickerController *)picker {
  [picker dismissViewControllerAnimated:YES completion:NULL];
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

@end
