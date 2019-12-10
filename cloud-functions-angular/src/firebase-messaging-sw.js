importScripts('https://www.gstatic.com/firebasejs/7.5.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.5.2/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  // TODO add your messagingSenderId
  messagingSenderId: '662518903527'
});
var messaging = firebase.messaging();
