/**
 * To find your Firebase config object:
 * 
 * 1. Go to your [Project settings in the Firebase console](https://console.firebase.google.com/project/_/settings/general/)
 * 2. In the "Your apps" card, select the nickname of the app for which you need a config object.
 * 3. Select Config from the Firebase SDK snippet pane.
 * 4. Copy the config object snippet, then add it here.
 */const firebaseConfig = {
  apiKey: "AIzaSyBSJW9tIwB_8dq_4GTGdV4XNiFycjT8EWI",
  authDomain: "friendlychat-e77d8.firebaseapp.com",
  projectId: "friendlychat-e77d8",
  storageBucket: "friendlychat-e77d8.appspot.com",
  messagingSenderId: "964967125202",
  appId: "1:964967125202:web:3a5b29727ad52584f15d0b"
};const config = {
  /* TODO: ADD YOUR FIREBASE CONFIGURATION OBJECT HERE */
};

export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error('No Firebase configuration object provided.' + '\n' +
    'Add your web app\'s configuration object to firebase-config.js');
  } else {
    return config;
  }
}
