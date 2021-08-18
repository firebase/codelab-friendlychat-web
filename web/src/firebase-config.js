/**
 * To find your Firebase config object:
 * 
 * 1. Go to your [Project settings in the Firebase console](https://console.firebase.google.com/project/_/settings/general/)
 * 2. In the "Your apps" card, select the nickname of the app for which you need a config object.
 * 3. Select Config from the Firebase SDK snippet pane.
 * 4. Copy the config object snippet, then add it here.
 */
const config = {
  apiKey: "AIzaSyA1wi5XsCm1MxgDj0-ZzZbE0HUok8SzMtA",
  authDomain: "jeff-friendlychat.firebaseapp.com",
  projectId: "jeff-friendlychat",
  storageBucket: "jeff-friendlychat.appspot.com",
  messagingSenderId: "867785543354",
  appId: "1:867785543354:web:b3db9ce03f5aae80e9bc83",
  measurementId: "G-VSW8REXN8P"
};

export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error('No Firebase configuration object provided.' + '\n' +
    'Add your web app\'s configuration object to firebase-config.js');
  } else {
    return config;
  }
}