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
import Firebase.CloudMessaging
import Firebase.AppInvite

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, GCMReceiverDelegate {

  var window: UIWindow?

  func application(application: UIApplication, didFinishLaunchingWithOptions
    launchOptions: [NSObject: AnyObject]?) -> Bool {
      NSNotificationCenter.defaultCenter().addObserver(self, selector: "connectToFriendlyPing",
        name: Constants.NotificationKeys.SignedIn, object: nil)
      configureFIRContext()
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

    // Initialize sign-in
    GINInvite.applicationDidFinishLaunching()

    // [START usermanagement_initialize]
    // Configure the default Firebase application
    let googleSignIn = FIRGoogleSignInAuthProvider.init(clientId: FIRContext.sharedInstance().serviceInfo.clientID)

    let firebaseOptions = FIRFirebaseOptions()
    firebaseOptions.GITkitAPIKey = FIRContext.sharedInstance().serviceInfo.apiKey
    firebaseOptions.GITkitWidgetURL = NSURL(string: "https://gitkitmobile.appspot.com/gitkit.jsp")
    firebaseOptions.signInProviders = [googleSignIn!];
    FIRFirebaseApp.initializedAppWithAppId(FIRContext.sharedInstance().serviceInfo.googleAppID, options: firebaseOptions)
    // [END usermanagement_initialize]

    let senderID = FIRContext.sharedInstance().serviceInfo.gcmSenderID
    AppState.sharedInstance.senderID = senderID
    AppState.sharedInstance.serverAddress = "\(senderID)@gcm.googleapis.com"
  }

    func configureGCMService() {
      let config = GCMConfig.defaultConfig()
      config.receiverDelegate = self
      config.logLevel = GCMLogLevel.Debug
      GCMService.sharedInstance().startWithConfig(config)
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
    if #available(iOS 9.0, *) {
      if (FIRFirebaseApp.handleOpenURL(url, sourceApplication: options[UIApplicationOpenURLOptionsSourceApplicationKey] as! String)) {
        return true
      }
    } else {
      // Fallback on earlier versions
    }
    return false
  }

  // [START openurl]
  func application(application: UIApplication,
    openURL url: NSURL, sourceApplication: String?, annotation: AnyObject) -> Bool {
      let invite = GINInvite.handleURL(url, sourceApplication:sourceApplication, annotation:annotation)

      if (invite != nil) {
        GINInvite.completeInvitation()
        let matchType =
        (invite.matchType == GINReceivedInviteMatchType.Weak) ? "Weak" : "Strong"
        print("Invite received from: \(sourceApplication) Deeplink: \(invite.deepLink)," +
          "Id: \(invite.inviteId), Type: \(matchType)")
        GINInvite.convertInvitation(invite.inviteId)
        return true
      }

      return GIDSignIn.sharedInstance().handleURL(url, sourceApplication: sourceApplication, annotation: annotation)
  }
  // [END openurl]


  func applicationDidBecomeActive( application: UIApplication) {
    GCMService.sharedInstance().connectWithHandler({
      (NSError error) -> Void in
      if error != nil {
        print("Could not connect to GCM: \(error.localizedDescription)")
      } else {
        print("Connected to GCM")
        AppState.sharedInstance.connectedToGcm = true
        self.connectToFriendlyPing()
      }
    })
  }

  func applicationDidEnterBackground(application: UIApplication) {
    GCMService.sharedInstance().disconnect()
    AppState.sharedInstance.connectedToGcm = false
  }

  func application( application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken
    deviceToken: NSData ) {
      GGLInstanceID.sharedInstance().startWithConfig(GGLInstanceIDConfig.defaultConfig())
      let registrationOptions = [kGGLInstanceIDRegisterAPNSOption:deviceToken,
        kGGLInstanceIDAPNSServerTypeSandboxOption:true]
      GGLInstanceID.sharedInstance().tokenWithAuthorizedEntity(AppState.sharedInstance.senderID,
        scope: kGGLInstanceIDScopeGCM, options: registrationOptions, handler: registrationHandler)
  }

  func application( application: UIApplication, didFailToRegisterForRemoteNotificationsWithError
    error: NSError ) {
      print("Registration for remote notification failed with error: \(error.localizedDescription)")
      let userInfo = ["error": error.localizedDescription]
      NSNotificationCenter.defaultCenter().postNotificationName(
        Constants.NotificationKeys.Registration, object: nil, userInfo: userInfo)
  }

  func registrationHandler(registrationToken: String!, error: NSError!) {
    if (registrationToken != nil) {
      AppState.sharedInstance.registrationToken = registrationToken;
      print("Registration Token: \(registrationToken)")
      connectToFriendlyPing()
      let userInfo = ["registrationToken": registrationToken]
      NSNotificationCenter.defaultCenter().postNotificationName(
        Constants.NotificationKeys.Registration, object: nil, userInfo: userInfo)
    } else {
      print("Registration to GCM failed with error: \(error.localizedDescription)")
      let userInfo = ["error": error.localizedDescription]
      NSNotificationCenter.defaultCenter().postNotificationName(
        Constants.NotificationKeys.Registration, object: nil, userInfo: userInfo)
    }
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
      GCMService.sharedInstance().appDidReceiveMessage(userInfo);
      NSNotificationCenter.defaultCenter().postNotificationName(
        Constants.NotificationKeys.Message, object: nil, userInfo: userInfo)
      handler(UIBackgroundFetchResult.NoData);
  }

  func connectToFriendlyPing() {
    if AppState.sharedInstance.connectedToGcm && AppState.sharedInstance.signedIn &&
      AppState.sharedInstance.registrationToken != nil {
        subscribeToTopic()
    }
  }

  func subscribeToTopic() {
    if !AppState.sharedInstance.subscribed {
      GCMPubSub().subscribeWithToken(AppState.sharedInstance.registrationToken!,
        topic: Constants.GCMStrings.Topic, options: nil, handler: {
          (NSError error) -> Void in
          if (error != nil) {
            // TODO(silvano): treat already subscribed with more grace
            print("Error subscribing: \(error)")
            print("Topic subscription failed with error: \(error.localizedDescription)")
            let userInfo = ["error": error.localizedDescription]
            NSNotificationCenter.defaultCenter().postNotificationName(
              Constants.NotificationKeys.Registration, object: nil, userInfo: userInfo)
          } else {
            AppState.sharedInstance.subscribed = true
          }
      })
    }
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