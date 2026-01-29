import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

try {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("FIREBASE_PRIVATE_KEY is missing in environment variables");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    })
  });
  console.log("Firebase Admin initialized");
} catch (e) {
  console.error("Firebase Admin init error:", e.message);
  throw e;
}

export default admin.firestore();
