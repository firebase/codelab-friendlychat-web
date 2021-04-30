importScripts('https://www.gstatic.com/firebasejs/8.4.3/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.4.3/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  // TODO add your messagingSenderId
  messagingSenderId: ''
});
var messaging = firebase.messaging();
