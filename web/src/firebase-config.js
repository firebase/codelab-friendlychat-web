/**
 * To find your Firebase config object:
 * 
 * 1. Go to your [Project settings in the Firebase console](https://console.firebase.google.com/project/_/settings/general/)
 * 2. In the "Your apps" card, select the nickname of the app for which you need a config object.
 * 3. Select Config from the Firebase SDK snippet pane.
 * 4. Copy the config object snippet, then add it here.
 */
const config = {
  /* TODO: ADD YOUR FIREBASE CONFIGURATION OBJECT HERE */
  apiKey: "AIzaSyDgY1dBsJHB-pyxxrI1gvKOXgqy9qkxep8",
  authDomain: "friendlychat-6996b.firebaseapp.com",
  projectId: "friendlychat-6996b",
  storageBucket: "friendlychat-6996b.appspot.com",
  messagingSenderId: "353242230311",
  appId: "1:353242230311:web:aea2c958f87a338d752802",
  measurementId: "G-JBG5YPV0MH"
};

export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error('No Firebase configuration object provided.' + '\n' +
    'Add your web app\'s configuration object to firebase-config.js');
  } else {
    return config;
  }
}