/**
 * To find your Firebase config object:
 *
 * 1. Go to your [Project settings in the Firebase console](https://console.firebase.google.com/project/_/settings/general/)
 * 2. In the "Your apps" card, select the nickname of the app for which you need a config object.
 * 3. Select Config from the Firebase SDK snippet pane.
 * 4. Copy the config object snippet, then add it here.
 */
 const config = {
  apiKey: "AIzaSyC8_RN-bWn1A0-ICW-Gjzjp8g8kfJxUhiQ",
  authDomain: "friendly-chat-e8b14.firebaseapp.com",
  projectId: "friendly-chat-e8b14",
  storageBucket: "friendly-chat-e8b14.appspot.com",
  messagingSenderId: "105454020979",
  appId: "1:105454020979:web:37c60b339d054b01d73d06",
  measurementId: "G-END7P3X7GR"
};

export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error('No Firebase configuration object provided.' + '\n' +
    'Add your web app\'s configuration object to firebase-config.js');
  } else {
    return config;
  }
}