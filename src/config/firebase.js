import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

let db;

try {
  let credential;
  
  // 1. Try Individual Env Vars (Master Prompt Requirement)
  // This is the preferred method for Render to keep secrets safe and minimal
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Handle private key newlines correctly
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    });
  }
  // 2. Try FIREBASE_SERVICE_ACCOUNT (JSON string) - Backward Compatibility
  else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      credential = admin.credential.cert(serviceAccount);
    } catch (e) {
      console.warn("Failed to parse FIREBASE_SERVICE_ACCOUNT:", e.message);
    }
  } 
  // 3. Try FIREBASE_SERVICE_ACCOUNT_BASE64 (Render alternative)
  else if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    try {
      const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'));
      credential = admin.credential.cert(serviceAccount);
    } catch (e) {
      console.warn("Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64:", e.message);
    }
  }
  // 4. Try GOOGLE_APPLICATION_CREDENTIALS / Application Default
  else {
    try {
      credential = admin.credential.applicationDefault();
    } catch (e) {
      console.warn("Failed to load Application Default Credentials:", e.message);
    }
  }

  if (!admin.apps.length) {
    if (credential) {
      admin.initializeApp({
        credential: credential,
        projectId: process.env.FIREBASE_PROJECT_ID || "medi-payment-reminder"
      });
      db = admin.firestore();
      console.log("✅ Firebase Admin Initialized");
    } else {
      console.warn("⚠️ No valid Firebase credentials found. Database features will fail.");
      throw new Error("No credentials");
    }
  } else {
    db = admin.firestore();
  }

} catch (error) {
  console.error("❌ Firebase Initialization Error:", error.message);
  console.warn("⚠️ Using Mock Database to allow server startup.");
  
  // Mock DB to prevent crash
  const mockCollection = () => ({
    doc: () => ({
      get: async () => ({ exists: false, data: () => ({}) }),
      set: async () => console.log("Mock DB Write"),
      update: async () => console.log("Mock DB Update"),
      collection: mockCollection,
      add: async () => ({ id: "mock_id" })
    }),
    get: async () => ({ empty: true, forEach: () => {} }),
    add: async () => ({ id: "mock_id" }),
    where: () => ({ where: () => ({ get: async () => ({ empty: true }) }) })
  });

  db = {
    collection: mockCollection
  };
}

export default db;
