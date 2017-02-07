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

#import "Constants.h"
#import "MeasurementHelper.h"
#import "SignInViewController.h"

@import Firebase;

@interface SignInViewController ()
@property(weak, nonatomic) IBOutlet GIDSignInButton *signInButton;
@property(strong, nonatomic) FIRAuthStateDidChangeListenerHandle handle;
@end

@implementation SignInViewController

- (void)viewDidLoad {
  [super viewDidLoad];
  [GIDSignIn sharedInstance].uiDelegate = self;
  [[GIDSignIn sharedInstance] signInSilently];
  self.handle = [[FIRAuth auth]
                 addAuthStateDidChangeListener:^(FIRAuth *_Nonnull auth, FIRUser *_Nullable user) {
                   if (user) {
                     [MeasurementHelper sendLoginEvent];
                     [self performSegueWithIdentifier:SeguesSignInToFp sender:nil];
                   }
                 }];
}

- (void)dealloc {
  [[FIRAuth auth] removeAuthStateDidChangeListener:_handle];
}

@end
