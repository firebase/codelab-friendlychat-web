import React from "react";
import ReactDOM from "react-dom";
import BrowserRouter from "./BrowserRouter.js";
// import {Route} from 'react-router-dom';
import App from "./App.js";

import * as firebase from 'firebase';
const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID
};
firebase.initializeApp(config);
// const unsubscribe = firebase.auth().onAuthStateChanged(async user => {
//   if (!user) {
//     window.sessionStorage.removeItem('potatoStorage');
//     firebase.auth().signOut();
//   }
// });
// firebase.database.enableLogging(function(message) {
//   console.group("[FIREBASE]", message);
// });
//
// if (('serviceWorker' in navigator) && firebase.messaging.isSupported()) {
//   const messaging = firebase.messaging();
//   navigator.serviceWorker.register('firebase-messaging-sw.js')
//   .then(function(registration) {
//     messaging.useServiceWorker(registration);
//   }).catch(function(err) {
//     console.log('Service worker registration failed, error:', err);
//   });
//   messaging.onMessage(function(payload) {
//     console.log('onMessage', payload);
//   });
// };

ReactDOM.render(
  <BrowserRouter>
    <App firebase={firebase} />
  </BrowserRouter>,
  document.getElementById("root")
);
