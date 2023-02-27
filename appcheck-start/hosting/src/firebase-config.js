/**
 * To find your Firebase config object:
 * 
 * 1. Go to your [Project settings in the Firebase console](https://console.firebase.google.com/project/_/settings/general/)
 * 2. In the "Your apps" card, select the nickname of the app for which you need a config object.
 * 3. Select Config from the Firebase SDK snippet pane.
 * 4. Copy the config object snippet, then add it here.
 */
const config = {
};

export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error('No Firebase configuration object provided.' + '\n' +
    'Add your web app\'s configuration object to firebase-config.js');
  } else {
    return config;
  }
}

const reCAPTCHAEnterpriseKey = {
  // Replace with your recaptcha enterprise site key
  key: "Replace with your recaptcha enterprise site key"
};

export function getReCaptchaKey() {
  if (!reCAPTCHAEnterpriseKey || !reCAPTCHAEnterpriseKey.key) {
    throw new Error('No enterprise reCaptcha key found.' + '\n' +
    'Add pme om the web app\'s config in firebase-config.js');
  } else {
    return reCAPTCHAEnterpriseKey.key;
  }
}