// Import and configure the Firebase SDK
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging/sw';

// async function setupFirebase() {
//   const config = await fetch('/__/firebase/init.json').then((resp) =>
//     resp.json()
//   );
//   const firebaseApp = initializeApp(config);

//   getMessaging(firebaseApp);

//   console.info('Firebase messaging service worker is set up');
// }

// setupFirebase();


  const firebaseApp = initializeApp({
    apiKey: "AIzaSyA1wi5XsCm1MxgDj0-ZzZbE0HUok8SzMtA",
    authDomain: "jeff-friendlychat.firebaseapp.com",
    projectId: "jeff-friendlychat",
    storageBucket: "jeff-friendlychat.appspot.com",
    messagingSenderId: "867785543354",
    appId: "1:867785543354:web:b3db9ce03f5aae80e9bc83",
    measurementId: "G-VSW8REXN8P"
  });

  getMessaging(firebaseApp);

  console.info('Firebase messaging service worker is set up');
