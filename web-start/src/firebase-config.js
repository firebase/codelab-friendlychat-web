/**
 * To find your Firebase config object:
 * 
 * 1. Go to your [Project settings in the Firebase console](https://console.firebase.google.com/project/_/settings/general/)
 * 2. In the "Your apps" card, select the nickname of the app for which you need a config object.
 * 3. Select Config from the Firebase SDK snippet pane.
 * 4. Copy the config object snippet, then add it here.
 */

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyArADvKWCdohOR7EeumMgxSIGJcSmbwN6k",
  authDomain: "friendlychat-4d180.firebaseapp.com",
  projectId: "friendlychat-4d180",
  storageBucket: "friendlychat-4d180.appspot.com",
  messagingSenderId: "813092620832",
  appId: "1:813092620832:web:5f4e45e2fc9269fd9b8a45",
  measurementId: "G-KR7T4WBLGD"
};

/**
export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error('No Firebase configuration object provided.' + '\n' +
    'Add your web app\'s configuration object to firebase-config.js');
  } else {
    return config;
  }
}
*/
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);