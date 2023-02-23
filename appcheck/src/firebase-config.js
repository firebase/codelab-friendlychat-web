/**
 * To find your Firebase config object:
 * 
 * 1. Go to your [Project settings in the Firebase console](https://console.firebase.google.com/project/_/settings/general/)
 * 2. In the "Your apps" card, select the nickname of the app for which you need a config object.
 * 3. Select Config from the Firebase SDK snippet pane.
 * 4. Copy the config object snippet, then add it here.
 */
const config = {
  apiKey: "AIzaSyCsPiMQWrMWQKB0PrQDfHbxokTcR4TRxGc",
  authDomain: "qs-nohe-fb-func.firebaseapp.com",
  projectId: "qs-nohe-fb-func",
  storageBucket: "qs-nohe-fb-func.appspot.com",
  messagingSenderId: "668582889497",
  appId: "1:668582889497:web:daa041767d60d39b964288"
};

export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error('No Firebase configuration object provided.' + '\n' +
    'Add your web app\'s configuration object to firebase-config.js');
  } else {
    return config;
  }
}