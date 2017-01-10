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

  override func viewDidAppear(_ animated: Bool) {
    if let user = FIRAuth.auth()?.currentUser {
      self.signedIn(user)
    }
  }

  @IBAction func didTapSignIn(_ sender: AnyObject) {
    // Sign In with credentials.
    guard let email = emailField.text, let password = passwordField.text else { return }
    FIRAuth.auth()?.signIn(withEmail: email, password: password) { (user, error) in
      if let error = error {
        print(error.localizedDescription)
        return
      }
      self.signedIn(user!)
    }
  }
  @IBAction func didTapSignUp(_ sender: AnyObject) {
    guard let email = emailField.text, let password = passwordField.text else { return }
    FIRAuth.auth()?.createUser(withEmail: email, password: password) { (user, error) in
      if let error = error {
        print(error.localizedDescription)
        return
      }
      self.setDisplayName(user!)
    }
  }

  func setDisplayName(_ user: FIRUser) {
    let changeRequest = user.profileChangeRequest()
    changeRequest.displayName = user.email!.components(separatedBy: "@")[0]
    changeRequest.commitChanges() {(error) in
      if let error = error {
        print(error.localizedDescription)
        return
      }
      self.signedIn(FIRAuth.auth()?.currentUser)
    }
  }

  @IBAction func didRequestPasswordReset(_ sender: AnyObject) {
    let prompt = UIAlertController.init(title: nil, message: "Email:", preferredStyle: .alert)
    let okAction = UIAlertAction.init(title: "OK", style: .default) { (action) in
      guard let userInput = prompt.textFields![0].text, !userInput.isEmpty else { return }
      FIRAuth.auth()?.sendPasswordReset(withEmail: userInput) { (error) in
        if let error = error {
          print(error.localizedDescription)
          return
        }
      }
    }
    prompt.addTextField(configurationHandler: nil)
    prompt.addAction(okAction)
    present(prompt, animated: true, completion: nil)
  }

  func signedIn(_ user: FIRUser?) {
    MeasurementHelper.sendLoginEvent()

    AppState.sharedInstance.displayName = user?.displayName ?? user?.email
    AppState.sharedInstance.photoURL = user?.photoURL
    AppState.sharedInstance.signedIn = true
    let notificationName = Notification.Name(rawValue: Constants.NotificationKeys.SignedIn)
    NotificationCenter.default.post(name: notificationName, object: nil, userInfo: nil)
    performSegue(withIdentifier: Constants.Segues.SignInToFp, sender: nil)
  }

}
