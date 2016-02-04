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
#import "Constants.h"
#import "AppState.h"
#import "FirebaseAuthProviderGoogle/FIRGoogleSignInAuthProvider.h"
#import "FirebaseApp/FIRFirebaseApp.h"
#import "FirebaseApp/FIRFirebaseOptions.h"
@import Firebase.AdMob;
@import Firebase.AppInvite;
@import Firebase.CloudMessaging;

@interface AppDelegate ()

@end

@implementation AppDelegate


- (BOOL)application:(UIApplication *)application
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(connectToFriendlyChat)
                                               name:NotificationKeysSignedIn object:nil];
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
}

- (void)configureGCMService {
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
  return YES;
}

- (BOOL)application:(UIApplication *)application openURL:(nonnull NSURL *)url
    sourceApplication:(nullable NSString *)sourceApplication annotation:(nonnull id)annotation {
  return YES;
}

- (void) applicationDidBecomeActive:(UIApplication *)application {
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
  [[GCMService sharedInstance] disconnect];
  [AppState sharedInstance].connectedToGcm = false;
}

- (void)application:(UIApplication *)application
    didRegisterForRemoteNotificationsWithDeviceToken:(nonnull NSData *)deviceToken {
}

- (void)application:(UIApplication *)application
    didFailToRegisterForRemoteNotificationsWithError:(nonnull NSError *)error {
  NSLog(@"Registration for remote notification failed with error: %@", error.localizedDescription);
  NSDictionary *userInfo = @{@"error": error.localizedDescription};
  [[NSNotificationCenter defaultCenter] postNotificationName:NotificationKeysRegistration object:nil
                                                    userInfo:userInfo];
}

- (void)registrationHandler:(nonnull NSString *)registrationToken error:(nonnull NSError *)error {
}

- (void)application:(UIApplication *)application
    didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo {
  [[GCMService sharedInstance] appDidReceiveMessage:userInfo];
  [[NSNotificationCenter defaultCenter] postNotificationName:NotificationKeysMessage object:nil
                                                    userInfo:userInfo];
}

- (void)application:(UIApplication *)application
    didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo
        fetchCompletionHandler:(nonnull void (^)(UIBackgroundFetchResult))completionHandler {
}


- (void)connectToFriendlyChat {
  if ([AppState sharedInstance].connectedToGcm && [AppState sharedInstance].signedIn &&
      ([AppState sharedInstance].registrationToken != nil)) {
    [self subscribeToTopic];
    }
}

- (void)subscribeToTopic {
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
