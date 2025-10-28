// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBNtK58OYqt6BTCuJOfyHrr9f5I-Rf36Uo",
  authDomain: "seget-app.firebaseapp.com",
  projectId: "seget-app",
  storageBucket: "seget-app.firebasestorage.app",
  messagingSenderId: "258663027743",
  appId: "1:258663027743:web:202e9df714b38e39e3312a",
  measurementId: "G-138RR0SNH5"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);