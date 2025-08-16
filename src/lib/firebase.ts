
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "tableauchef",
  "appId": "1:435090684209:web:955bb2b1421920454c9810",
  "storageBucket": "tableauchef.firebasestorage.app",
  "apiKey": "AIzaSyBZo9MrJBXzIaTkIeErm5CnkGn6iXAwW-A",
  "authDomain": "tableauchef.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "4_3_5_0_9_0_6_8_4_2_0_9"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
