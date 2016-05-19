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

import Firebase

@objc(SignInViewController)
class SignInViewController: UIViewController {

  @IBOutlet weak var emailField: UITextField!
  @IBOutlet weak var passwordField: UITextField!

  override func viewDidAppear(animated: Bool) {
  }

  @IBAction func didTapSignIn(sender: AnyObject) {
    signedIn(nil)
  }

  @IBAction func didTapSignUp(sender: AnyObject) {
    setDisplayName(nil)
  }

  func setDisplayName(user: FIRUser?) {
    signedIn(nil)
  }

  @IBAction func didRequestPasswordReset(sender: AnyObject) {
  }

  func signedIn(user: FIRUser?) {
    MeasurementHelper.sendLoginEvent()

    AppState.sharedInstance.signedIn = true
    NSNotificationCenter.defaultCenter().postNotificationName(Constants.NotificationKeys.SignedIn, object: nil, userInfo: nil)
    performSegueWithIdentifier(Constants.Segues.SignInToFp, sender: nil)
  }

}
