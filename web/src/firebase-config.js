/**
 * To find your Firebase config object:
 * 
 * 1. Go to your [Project settings in the Firebase console](https://console.firebase.google.com/project/_/settings/general/)
 * 2. In the "Your apps" card, select the nickname of the app for which you need a config object.
 * 3. Select Config from the Firebase SDK snippet pane.
 * 4. Copy the config object snippet, then add it here.
 */
const config = {
  const firebaseConfig = {
  apiKey: "AIzaSyBc3gEEJRI_jk9SK5RshQ4j8SW-q3y4i8Q",
  authDomain: "friendlychat-53eb6.firebaseapp.com",
  projectId: "friendlychat-53eb6",
  storageBucket: "friendlychat-53eb6.appspot.com",
  messagingSenderId: "1097593266385",
  appId: "1:1097593266385:web:5fffb0d335d2456f6325f0"
};
};

export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error('No Firebase configuration object provided.' + '\n' +
    'Add your web app\'s configuration object to firebase-config.js');
  } else {
    return config;
  }
}
