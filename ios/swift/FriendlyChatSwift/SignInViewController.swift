//
//  Copyright (c) 2015 Google Inc.
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

import UIKit
import FirebaseApp
import FirebaseAuth
import FirebaseAuthUI
import Firebase.Core
import Firebase.SignIn
import Firebase.AppInvite

class SignInViewController: UIViewController {

  @IBOutlet weak var emailField: UITextField!
  @IBOutlet weak var passwordField: UITextField!

  override func viewDidLoad() {
    super.viewDidLoad()
  }

  @IBAction func didTapSignIn(sender: AnyObject) {
    // Sign In with credentials.
    let email = emailField.text
    let password = passwordField.text
    FIRAuth.auth()?.signInWithEmail(email!, password: password!, callback: { (user, error) in
      if let error = error {
        print(error.localizedDescription)
        return
      }
      self.signedIn(user!)
    })
  }

  @IBAction func didTapSignUp(sender: AnyObject) {
    let email = emailField.text
    let password = passwordField.text
    FIRAuth.auth()?.createUserWithEmail(email!, password: password!, callback: { (user, error) in
      if let error = error {
        print(error.localizedDescription)
        return
      }
      self.signedIn(user!)
    })
  }

  @IBAction func didTapSignInWithGoogle(sender: AnyObject) {
    let firebaseAuth = FIRAuth.auth()
    let firebaseAuthUI = FIRAuthUI.init(forApp: firebaseAuth!.app!)
    firebaseAuthUI!.presentSignInWithViewController(self) { (user, error) in
      if let error = error {
        print(error.localizedDescription)
        return
      }
      self.signedIn(user!)
    }
  }

  func signedIn(user: FIRUser) {
    MeasurementHelper.sendLoginEvent()

    AppState.sharedInstance.displayName = user.displayName
    AppState.sharedInstance.photoUrl = user.photoURL
    AppState.sharedInstance.signedIn = true
    NSNotificationCenter.defaultCenter().postNotificationName(Constants.NotificationKeys.SignedIn,
      object: nil, userInfo: nil)
    performSegueWithIdentifier(Constants.Segues.SignInToFp, sender: nil)
  }

}
