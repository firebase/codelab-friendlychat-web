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
#import "FirebaseApp/FIRFirebaseApp.h"
#import "FirebaseApp/FIRFirebaseOptions.h"
#import "FirebaseAuthUI/FIRAuthUI.h"
#import "FirebaseAuthProviderGoogle/FIRGoogleSignInAuthProvider.h"
#import "FirebaseAuth/FIRUser.h"
#import "MeasurementHelper.h"
#import "SignInViewController.h"

@import Firebase.Core;
@import Firebase.SignIn;

@interface SignInViewController ()<FIRAuthUIDelegate>

@property(nonatomic, weak) IBOutlet UIButton *signInButton;

@end

@implementation SignInViewController

- (IBAction)didTapSignIn:(UIButton *)sender {
  FIRAuth *firebaseAuth = [FIRAuth auth];
  FIRAuthUI *firebaseAuthUI = [FIRAuthUI authUIWithAuth:firebaseAuth delegate:self];
  [firebaseAuthUI presentSignInWithCallback:^(FIRUser *_Nullable user,
                                              NSError *_Nullable error) {
    if (error) {
      NSLog(error.localizedDescription);
      return;
    }

    [MeasurementHelper sendLoginEvent];

    [AppState sharedInstance].displayName = user.displayName;
    [AppState sharedInstance].photoUrl = user.photoURL;
    [AppState sharedInstance].signedIn = YES;
    [[NSNotificationCenter defaultCenter] postNotificationName:NotificationKeysSignedIn
                                                        object:nil userInfo:nil];
    [self signedIn];
  }];
}

- (void)signedIn {
  [self performSegueWithIdentifier:SeguesSignInToFp sender:nil];
}

@end
