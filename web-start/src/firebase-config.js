/**
 * To find your Firebase config object:
 * 
 * 1. Go to your [Project settings in the Firebase console](https://console.firebase.google.com/project/_/settings/general/)
 * 2. In the "Your apps" card, select the nickname of the app for which you need a config object.
 * 3. Select Config from the Firebase SDK snippet pane.
 * 4. Copy the config object snippet, then add it here.
 */
const config = {
  apiKey: "AIzaSyBeq1ogeWBzfv6Uyrb3sI8DsQie68PDrw4",
  authDomain: "ecv-hockey.firebaseapp.com",
  projectId: "ecv-hockey",
  storageBucket: "ecv-hockey.appspot.com",
  messagingSenderId: "552780137444",
  appId: "1:552780137444:web:a2b26b3346f4b7d4bbfdf1",
  measurementId: "G-HVPHL8RFSJ"
};

export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error('No Firebase configuration object provided.' + '\n' +
    'Add your web app\'s configuration object to firebase-config.js');
  } else {
    return config;
  }
}