import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// 1. Change 'getFirestore' to 'initializeFirestore'
import { initializeFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgRBLwl5GjmmOksRBcQuiyHp0MxdhZgCQ",
  authDomain: "chatbot-app-49a2c.firebaseapp.com",
  projectId: "chatbot-app-49a2c",
  storageBucket: "chatbot-app-49a2c.firebasestorage.app",
  messagingSenderId: "1012311310328",
  appId: "1:1012311310328:web:4ba3f10328bee4964e600d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// 2. THE MAGIC BULLET: Force standard HTTP instead of WebSockets
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});