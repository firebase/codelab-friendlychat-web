// Import and configure the Firebase SDK
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging/sw';

async function setupFirebase() {
  const config = await fetch('/__/firebase/init.json').then((resp) =>
    resp.json()
  );
  const firebaseApp = initializeApp(config);

  getMessaging(firebaseApp);

  console.info('Firebase messaging service worker is set up');
}

setupFirebase();
