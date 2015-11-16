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
import Firebase.Core
import Firebase.AppInvite

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, GCMReceiverDelegate {

  var window: UIWindow?

  func application(application: UIApplication, didFinishLaunchingWithOptions
    launchOptions: [NSObject: AnyObject]?) -> Bool {
      NSNotificationCenter.defaultCenter().addObserver(self, selector: "connectToFriendlyPing",
        name: Constants.NotificationKeys.SignedIn, object: nil)
      configureFIRContext()
      configureSignIn()
      configureGCMService()
      registerForRemoteNotifications(application)
      return true
  }

  func configureFIRContext() {
    // [START firebase_configure]
    // Use Firebase library to configure APIs
    do {
      try FIRContext.sharedInstance().configure()
    } catch let configureError as NSError{
      print ("Error configuring Firebase services: \(configureError)")
    }
    // [END firebase_configure]
  }

  func configureSignIn() {
  }


  func configureGCMService() {
  }

  func registerForRemoteNotifications(application: UIApplication) {
    if #available(iOS 8.0, *) {
      let types: UIUserNotificationType = [UIUserNotificationType.Badge,
        UIUserNotificationType.Alert, UIUserNotificationType.Sound]
      let settings: UIUserNotificationSettings =
      UIUserNotificationSettings( forTypes: types, categories: nil )
      application.registerUserNotificationSettings(settings)
      application.registerForRemoteNotifications()

    } else {
      // Fallback on earlier versions
      let types: UIRemoteNotificationType = [.Alert, .Badge, .Sound]
      application.registerForRemoteNotificationTypes(types)
    }
  }

  func application(app: UIApplication, openURL url: NSURL, options: [String : AnyObject]) -> Bool {
    return true
  }

  // [START openurl]
  func application(application: UIApplication,
    openURL url: NSURL, sourceApplication: String?, annotation: AnyObject) -> Bool {
      return true
  }
  // [END openurl]

  func applicationDidBecomeActive( application: UIApplication) {
  }

  func applicationDidEnterBackground(application: UIApplication) {
    GCMService.sharedInstance().disconnect()
    AppState.sharedInstance.connectedToGcm = false
  }

  func application( application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken
    deviceToken: NSData ) {
  }

  func application( application: UIApplication, didFailToRegisterForRemoteNotificationsWithError
    error: NSError ) {
      print("Registration for remote notification failed with error: \(error.localizedDescription)")
      let userInfo = ["error": error.localizedDescription]
      NSNotificationCenter.defaultCenter().postNotificationName(
        Constants.NotificationKeys.Registration, object: nil, userInfo: userInfo)
  }

  func registrationHandler(registrationToken: String!, error: NSError!) {
  }

  func application( application: UIApplication,
    didReceiveRemoteNotification userInfo: [NSObject : AnyObject]) {
      GCMService.sharedInstance().appDidReceiveMessage(userInfo);
      NSNotificationCenter.defaultCenter().postNotificationName(
        Constants.NotificationKeys.Message, object: nil, userInfo: userInfo)
  }

  func application( application: UIApplication,
    didReceiveRemoteNotification userInfo: [NSObject : AnyObject],
    fetchCompletionHandler handler: (UIBackgroundFetchResult) -> Void) {
  }

  func connectToFriendlyPing() {
    if AppState.sharedInstance.connectedToGcm && AppState.sharedInstance.signedIn &&
      AppState.sharedInstance.registrationToken != nil {
        subscribeToTopic()
    }
  }

  func subscribeToTopic() {
  }

  // TODO(silvano): do we actually need the message tracking in FP?
  func willSendDataMessageWithID(messageID: String, error: NSError) {
    print("Error sending message \(messageID): \(error)")
  }

  func didSendDataMessageWithID(messageID: String) {
    print("Message \(messageID) successfully sent")
  }

  func didDeleteMessagesOnServer() {
    print("Do something")
  }
}