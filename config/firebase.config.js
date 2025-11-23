// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJcDPaLVdkLEPsZSQEP-G4IrZkgZffRAI",
  authDomain: "electricity-usage-tracker.firebaseapp.com",
  projectId: "electricity-usage-tracker",
  storageBucket: "electricity-usage-tracker.firebasestorage.app",
  messagingSenderId: "478427658252",
  appId: "1:478427658252:web:d00d4011f92379414c9629",
  measurementId: "G-2VPYDPM5Z1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export default db; // Make sure this is default export
