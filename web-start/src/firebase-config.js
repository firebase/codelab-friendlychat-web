/**
 * To find your Firebase config object:
 * 
 * 1. Go to your [Project settings in the Firebase console](https://console.firebase.google.com/project/_/settings/general/)
 * 2. In the "Your apps" card, select the nickname of the app for which you need a config object.
 * 3. Select Config from the Firebase SDK snippet pane.
 * 4. Copy the config object snippet, then add it here.
 */
const config = {
  apiKey: "AIzaSyBnP8bYXie5oAHLbJ7W_owxy7XmfGFQlmE",
  authDomain: "friendlychat-c8791.firebaseapp.com",
  projectId: "friendlychat-c8791",
  storageBucket: "friendlychat-c8791.appspot.com",
  messagingSenderId: "1037079230582",
  appId: "1:1037079230582:web:3bb09a7eabaa6920554757"
};

export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error('No Firebase configuration object provided.' + '\n' +
    'Add your web app\'s configuration object to firebase-config.js');
  } else {
    return config;
  }
}