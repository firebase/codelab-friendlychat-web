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

#import "AppDelegate.h"
#import "AppState.h"
#import "Constants.h"
#import "FirebaseApp/FIRFirebaseApp.h"
#import "FirebaseApp/FIRFirebaseOptions.h"
#import "FirebaseAuthProviderGoogle/FIRGoogleSignInAuthProvider.h"

@import Firebase.AppInvite;
@import Firebase.CloudMessaging;
@import Firebase.Core;

@interface AppDelegate ()
- (void) connectToFriendlyPing;
@end

@implementation AppDelegate

__weak AppDelegate *weakSelf;

- (BOOL)application:(UIApplication *)application
didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(connectToFriendlyChat)
                                               name:NotificationKeysSignedIn object:nil];
  [GINInvite applicationDidFinishLaunchingWithOptions:launchOptions];
  [self configureFIRContext];
  [self configureSignIn];
  [self configureGCMService];
  [self registerForRemoteNotifications:application];
  return YES;
}

- (void)configureFIRContext {
  NSError *error;
  BOOL status =[[FIRContext sharedInstance] configure:&error];
  NSAssert(status, @"Error configuring Firebase services: %@", error);
}

- (void)configureSignIn {
  FIRGoogleSignInAuthProvider *googleSignIn = [[FIRGoogleSignInAuthProvider alloc]
      initWithClientID:[FIRContext sharedInstance].serviceInfo.clientID];

  FIRFirebaseOptions *firebaseOptions = [[FIRFirebaseOptions alloc] init];
  firebaseOptions.APIKey = [FIRContext sharedInstance].serviceInfo.apiKey;
  firebaseOptions.authWidgetURL =
      [NSURL URLWithString:@"https://gitkitmobile.appspot.com/gitkit.jsp"];
  firebaseOptions.signInProviders = @[googleSignIn];
  [FIRFirebaseApp initializedAppWithAppId:[FIRContext sharedInstance].serviceInfo.googleAppID
                                  options:firebaseOptions];
}

- (void)configureGCMService {
  NSString *senderID = [FIRContext sharedInstance].serviceInfo.gcmSenderID;
  [AppState sharedInstance].senderID = senderID;
  [AppState sharedInstance].serverAddress =
      [senderID stringByAppendingString:@"@gcm.googleapis.com"];

  GCMConfig *config = [GCMConfig defaultConfig];
  config.receiverDelegate = self;
  config.logLevel = kGCMLogLevelDebug;
  [[GCMService sharedInstance] startWithConfig:config];
}

- (void)registerForRemoteNotifications:(UIApplication *)application {
  UIUserNotificationType types = UIUserNotificationTypeBadge | UIUserNotificationTypeAlert |
      UIUserNotificationTypeSound;
  UIUserNotificationSettings *settings =
  [UIUserNotificationSettings settingsForTypes:types categories:nil];
  [application registerUserNotificationSettings:settings];
  [application registerForRemoteNotifications];
}

- (BOOL)application:(UIApplication *)app openURL:(nonnull NSURL *)url
            options:(nonnull NSDictionary<NSString *,id> *)options {
  if ([FIRFirebaseApp handleOpenURL:url
                  sourceApplication:options[UIApplicationOpenURLOptionsSourceApplicationKey]]) {
    return YES;
  }
  return NO;
}

- (BOOL)application:(UIApplication *)application openURL:(nonnull NSURL *)url
  sourceApplication:(nullable NSString *)sourceApplication annotation:(nonnull id)annotation {
  GINReceivedInvite *invite = [GINInvite handleURL:url
                                 sourceApplication:sourceApplication annotation:annotation];
  if (invite) {
    NSString *matchType =
    (invite.matchType == kGINReceivedInviteMatchTypeWeak) ? @"Weak" : @"Strong";
    NSLog(@"Invite received from: %@ Deeplink: %@, Id: %@, Type: %@",
          sourceApplication, invite.deepLink, invite.inviteId, matchType);

    [GINInvite convertInvitation:invite.inviteId];
    return YES;
  }

  return [[GIDSignIn sharedInstance] handleURL:url
                             sourceApplication:sourceApplication
                                    annotation:annotation];
}

- (void) applicationDidBecomeActive:(UIApplication *)application {
  [[GCMService sharedInstance] connectWithHandler:^(NSError *error) {
    if (error) {
      NSLog(@"Could not connect to GCM: %@", error.localizedDescription);
    } else {
      NSLog(@"Connected to GCM");
      [AppState sharedInstance].connectedToGcm = true;
      [self connectToFriendlyPing];
    }
  }];
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
  [[GCMService sharedInstance] disconnect];
  [AppState sharedInstance].connectedToGcm = false;
}

- (void)application:(UIApplication *)application
    didRegisterForRemoteNotificationsWithDeviceToken:(nonnull NSData *)deviceToken {
  [[GGLInstanceID sharedInstance] startWithConfig:[GGLInstanceIDConfig defaultConfig]];
  NSDictionary *registrationOptions = @{kGGLInstanceIDRegisterAPNSOption:deviceToken,
                                        kGGLInstanceIDAPNSServerTypeSandboxOption:@YES};
  weakSelf = self;
  [[GGLInstanceID sharedInstance] tokenWithAuthorizedEntity:[AppState sharedInstance].senderID
                                                      scope:kGGLInstanceIDScopeGCM
                                                    options:registrationOptions
                                                    handler:registrationHandler];
}


- (void)application:(UIApplication *)application
    didFailToRegisterForRemoteNotificationsWithError:(nonnull NSError *)error {
  NSLog(@"Registration for remote notification failed with error: %@", error.localizedDescription);
  NSDictionary *userInfo = @{@"error": error.localizedDescription};
  [[NSNotificationCenter defaultCenter] postNotificationName:NotificationKeysRegistration
                                                      object:nil
                                                    userInfo:userInfo];
}

void (^registrationHandler)(NSString *registrationToken, NSError *error) =
^(NSString *registrationToken, NSError *error) {
  if (registrationToken) {
    [AppState sharedInstance].registrationToken = registrationToken;
    NSLog(@"Registration Token: %@", registrationToken);
    [weakSelf connectToFriendlyPing];
    NSDictionary *userInfo = @{@"registrationToken": registrationToken};
    [[NSNotificationCenter defaultCenter] postNotificationName:NotificationKeysRegistration
                                                        object:nil
                                                      userInfo:userInfo];
  } else {
    NSLog(@"Registration to GCM failed with error: %@", error.localizedDescription);
    NSDictionary *userInfo = @{@"error": error.localizedDescription};
    [[NSNotificationCenter defaultCenter] postNotificationName:NotificationKeysRegistration
                                                        object: nil
                                                      userInfo: userInfo];
  }
};

- (void)application:(UIApplication *)application
    didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo {
  [[GCMService sharedInstance] appDidReceiveMessage:userInfo];
  [[NSNotificationCenter defaultCenter] postNotificationName:NotificationKeysMessage object:nil
                                                    userInfo:userInfo];
}

- (void)application:(UIApplication *)application
    didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo
        fetchCompletionHandler:(nonnull void (^)(UIBackgroundFetchResult))handler {
  [[GCMService sharedInstance] appDidReceiveMessage:userInfo];
  [[NSNotificationCenter defaultCenter] postNotificationName:NotificationKeysMessage
                                                      object: nil
                                                    userInfo: userInfo];
  handler(UIBackgroundFetchResultNoData);
}


- (void)connectToFriendlyChat {
  if ([AppState sharedInstance].connectedToGcm && [AppState sharedInstance].signedIn &&
      ([AppState sharedInstance].registrationToken != nil)) {
    [self subscribeToTopic];
  }
}

- (void)subscribeToTopic {
  if (![AppState sharedInstance].subscribed) {
    [[GCMPubSub sharedInstance] subscribeWithToken:[AppState sharedInstance].registrationToken topic:GCMStringsTopic options:nil handler:^(NSError *error) {
      if (error) {
        // TODO(silvano): treat already subscribed with more grace
        NSLog(@"Error subscribing: %@", error);
        NSLog(@"Topic subscription failed with error: %@", error.localizedDescription);
        NSDictionary *userInfo = @{@"error": error.localizedDescription};
        [[NSNotificationCenter defaultCenter] postNotificationName:NotificationKeysRegistration
                                                            object: nil
                                                          userInfo: userInfo];
      } else {
        [AppState sharedInstance].subscribed = true;
      }
    }];
  }
}

- (void)willSendDataMessageWithID:(NSString *)messageID error:(NSError *)error {
  NSLog(@"Error sending message %@: %@", messageID, error);
}

- (void)didSendDataMessageWithID:(NSString *)messageID {
  NSLog(@"Message %@ successfully sent", messageID);
}

- (void)didDeleteMessagesOnServer {
  NSLog(@"Do something");
}

@end
