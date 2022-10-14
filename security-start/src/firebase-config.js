/**
 * To find your Firebase config object:
 * 
 * 1. Go to your [Project settings in the Firebase console](https://console.firebase.google.com/project/_/settings/general/)
 * 2. In the "Your apps" card, select the nickname of the app for which you need a config object.
 * 3. Select Config from the Firebase SDK snippet pane.
 * 4. Copy the config object snippet, then add it here.
 */
const config = {
  // This is a fake Firebase config object that can be used to test against
  // the emulator suite. In a production environment, you would follow the steps
  // above prior to deploying your app.
  apiKey: "fake-api-key",
  projectId: "demo-example",
  authDomain: "demo-example.firebaseapp.com",
  appId: "fakeid",
  storageBucket: "demo-example.appspot.com"
};

export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error('No Firebase configuration object provided.' + '\n' +
    'Add your web app\'s configuration object to firebase-config.js');
  } else {
    return config;
  }
}