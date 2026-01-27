const admin = require("firebase-admin");
const fs = require('fs');
const firebase = require('firebase/compat/app').default;
require('firebase/compat/firestore');
require("dotenv").config();

let db;

const initializeDB = () => {
  // STRATEGY 1: Try Admin SDK (Preferred for Backend)
  try {
    let credential;

    // 1.1 Check for Base64 Env Var (Render)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      try {
        const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'));
        // Validate private key format simply
        if (serviceAccount.private_key && serviceAccount.private_key.includes('BEGIN PRIVATE KEY')) {
            credential = admin.credential.cert(serviceAccount);
        }
      } catch (e) {
        console.warn("⚠️ FIREBASE_SERVICE_ACCOUNT_BASE64 found but invalid:", e.message);
      }
    } 
    // 1.2 Check GOOGLE_APPLICATION_CREDENTIALS
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      if (fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
        try {
            const serviceAccount = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
             if (serviceAccount.private_key && serviceAccount.private_key.includes('BEGIN PRIVATE KEY')) {
                credential = admin.credential.cert(serviceAccount);
            } else {
                console.warn("⚠️ serviceAccountKey.json exists but contains invalid/dummy key.");
            }
        } catch (e) {
             console.warn("⚠️ Failed to read serviceAccountKey.json:", e.message);
        }
      }
    }

    if (credential) {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: credential,
                projectId: "medi-payment-reminder"
            });
        }
        console.log("✅ Firebase Admin Initialized (Strategy 1)");
        return admin.firestore();
    }
  } catch (error) {
    console.warn("⚠️ Firebase Admin Strategy failed:", error.message);
  }

  // STRATEGY 2: Fallback to Client SDK (Compat Mode) using Public Config
  // This allows connection without a private key, though permissions might be limited.
  try {
    console.log("ℹ️ Attempting fallback to Firebase Client SDK...");
    const firebaseConfig = {
      apiKey: "AIzaSyCl4kDzeifWSescTJhakoy8-35q_ecWCBI",
      authDomain: "medi-payment-reminder.firebaseapp.com",
      projectId: "medi-payment-reminder",
      storageBucket: "medi-payment-reminder.firebasestorage.app",
      messagingSenderId: "110911991390",
      appId: "1:110911991390:web:79bd7c8b5823a8f6270ecf",
      measurementId: "G-C5ZCX6F3N6"
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    
    console.log("✅ Firebase Client SDK Initialized (Strategy 2 - Fallback)");
    return firebase.firestore();
  } catch (error) {
    console.error("❌ Firebase Client SDK Strategy failed:", error.message);
  }

  // STRATEGY 3: Mock DB (Last Resort)
  console.warn("⚠️ Using MOCK Firestore (DB calls will fail silently).");
  const mockCollection = () => ({
    doc: () => ({
      get: async () => ({ exists: false, data: () => ({}) }),
      set: async () => console.log("Mock DB Write"),
      update: async () => console.log("Mock DB Update"),
      collection: mockCollection
    }),
    get: async () => ({ empty: true, forEach: () => {} }),
    add: async () => ({ id: "mock_id" }),
    where: () => ({ where: () => ({ get: async () => ({ empty: true }) }) })
  });

  return {
    collection: mockCollection
  };
};

db = initializeDB();

module.exports = db;
