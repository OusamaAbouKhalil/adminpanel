// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCVvKV7q30Add4yie2TH1Cg2XLms1_bZcI",
  authDomain: "testing-4e27b.firebaseapp.com",
  databaseURL: "https://testing-4e27b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "testing-4e27b",
  storageBucket: "testing-4e27b.appspot.com",
  messagingSenderId: "461122896831",
  appId: "1:461122896831:web:578eb4bae80c4e4384570a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database service
const db = getDatabase(app);
export const fsdb = getFirestore(app);
export const auth = getAuth(app);

export default db;


