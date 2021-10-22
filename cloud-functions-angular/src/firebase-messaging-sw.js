importScripts('https://www.gstatic.com/firebasejs/8.6.7/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.6.7/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  // ***********************************************************************************************************************
  // * TODO(DEVELOPER): Update values according to: Firebase Console > Overview > Add Firebase to your web app. *
  // ***********************************************************************************************************************
  apiKey: '',
  authDomain: '',
  databaseURL: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: ''
});
var messaging = firebase.messaging();
