import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = { 
  apiKey: "AIzaSyCl4kDzeifWSescTJhakoy8-35q_ecWCBI", 
  authDomain: "medi-payment-reminder.firebaseapp.com", 
  projectId: "medi-payment-reminder", 
  storageBucket: "medi-payment-reminder.firebasestorage.app", 
  messagingSenderId: "110911991390", 
  appId: "1:110911991390:web:79bd7c8b5823a8f6270ecf", 
  measurementId: "G-C5ZCX6F3N6" 
};

// Initialize Firebase (Singleton pattern to prevent re-initialization)
let app;
if (typeof window !== "undefined") {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
} else {
    // Fallback for non-browser environments if this file is imported elsewhere
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
