// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQX-IJDodIagv03-4Sltt67xt3dHpucFg",
  authDomain: "friendlychat-dbfb6.firebaseapp.com",
  projectId: "friendlychat-dbfb6",
  storageBucket: "friendlychat-dbfb6.appspot.com",
  messagingSenderId: "967560725882",
  appId: "1:967560725882:web:2d584b05676678981d82c3",
  measurementId: "G-KFXLFD02TB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);