const firebase = require('firebase/compat/app');
require('firebase/compat/firestore');
require('firebase/compat/auth');

const firebaseConfig = { 
  apiKey: "AIzaSyCl4kDzeifWSescTJhakoy8-35q_ecWCBI", 
  authDomain: "medi-payment-reminder.firebaseapp.com", 
  projectId: "medi-payment-reminder", 
  storageBucket: "medi-payment-reminder.firebasestorage.app", 
  messagingSenderId: "110911991390", 
  appId: "1:110911991390:web:79bd7c8b5823a8f6270ecf", 
  measurementId: "G-C5ZCX6F3N6" 
};

let app;
if (!firebase.apps.length) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}

const db = app.firestore();
const auth = app.auth();

console.log("✅ Firebase Client SDK Initialized (Backend Mode)");

module.exports = { db, auth };
