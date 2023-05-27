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
   apiKey: "AIzaSyBDMUdlR9UYSkINszndN61-Z8uYg0FRHxU",
  authDomain: "friendlychat-e5c8a.firebaseapp.com",
  projectId: "friendlychat-e5c8a",
  storageBucket: "friendlychat-e5c8a.appspot.com",
  messagingSenderId: "918387472031",
  appId: "1:918387472031:web:ef5463c3b18a9a5b3454aa"
};

export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error('No Firebase configuration object provided.' + '\n' +
    'Add your web app\'s configuration object to firebase-config.js');
  } else {
    return config;
  }
}
