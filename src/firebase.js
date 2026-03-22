// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAqfxLQT_ugndhLMaPKD0JpUeGW--hDijs",
  authDomain: "fixitnow-plus.firebaseapp.com",
  projectId: "fixitnow-plus",
  storageBucket: "fixitnow-plus.firebasestorage.app",
  messagingSenderId: "1009060751842",
  appId: "1:1009060751842:web:effce30328d02e6cc931bb",
  measurementId: "G-8Y1SH6EGDT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
