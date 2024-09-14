// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDM7PY2pGPq_ZlOBqH0Dhq3np8nNmXbVf0",
  authDomain: "swift-drive-298cc.firebaseapp.com",
  databaseURL: "https://swift-drive-298cc-default-rtdb.firebaseio.com",
  projectId: "swift-drive-298cc",
  storageBucket: "swift-drive-298cc.appspot.com",
  messagingSenderId: "232886343826",
  appId: "1:232886343826:web:190d1a2a73673dd48bae4b",
  measurementId: "G-7WVKZGYP96",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const secondaryApp = initializeApp(firebaseConfig, "Secondary");

// Initialize Firestore with offline persistence
const fsdb = initializeFirestore(app, {
  cacheSizeBytes: 104857600, // 100 MB
  
});

// Initialize Realtime Database
const db = getDatabase(app);

// Initialize Auth
const auth = getAuth(app);
const secondaryAuth = getAuth(secondaryApp);

// Initialize Functions
const functions = getFunctions(app);

export { fsdb, auth, secondaryAuth, functions, httpsCallable };
export default db;
