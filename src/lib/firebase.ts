// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "tableauchef",
  "appId": "1:435090684209:web:955bb2b1421920454c9810",
  "storageBucket": "tableauchef.firebasestorage.app",
  "apiKey": "AIzaSyBZo9MrJBXzIaTkIeErm5CnkGn6iXAwW-A",
  "authDomain": "tableauchef.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "435090684209"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
