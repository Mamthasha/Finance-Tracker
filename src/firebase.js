// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPpaf9tVtPyYK4NjponS8he6SU0jeM1-Q",
  authDomain: "finance-tracker-bf0cc.firebaseapp.com",
  projectId: "finance-tracker-bf0cc",
  storageBucket: "finance-tracker-bf0cc.firebasestorage.app",
  messagingSenderId: "523226430932",
  appId: "1:523226430932:web:3400a7d146fb6b1dbfaa41",
  measurementId: "G-98M19YN6JK"
}; 

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;