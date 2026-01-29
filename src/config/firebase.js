import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

try {
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey || privateKey.includes("REPLACE_WITH")) {
    console.error("\n\x1b[31m[CRITICAL] FIREBASE_PRIVATE_KEY is missing or invalid in .env file.\x1b[0m");
    console.error("Please update .env with your Firebase Admin SDK credentials to connect to Firestore.\n");
    // We throw to prevent server starting with broken DB connection
    throw new Error("FIREBASE_PRIVATE_KEY is missing/invalid");
  }

  // Sanitize private key for multiple formats:
  // - Remove surrounding quotes if present
  // - Convert escaped \n to actual newlines
  // - Normalize Windows CRLF to LF
  privateKey = privateKey.replace(/^"+|"+$/g, "");
  // Remove any stray backslashes not followed by 'n'
  privateKey = privateKey.replace(/\\(?!n)/g, "");
  privateKey = privateKey.replace(/\\n/g, "\n").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  // Ensure newline after header and before footer
  privateKey = privateKey.replace(/-----BEGIN PRIVATE KEY-----\s*/, "-----BEGIN PRIVATE KEY-----\n");
  privateKey = privateKey.replace(/\s*-----END PRIVATE KEY-----\s*$/, "\n-----END PRIVATE KEY-----\n");
  if (!privateKey.startsWith("-----BEGIN PRIVATE KEY-----") || !privateKey.trim().endsWith("-----END PRIVATE KEY-----")) {
    console.error("\n\x1b[31m[CRITICAL] FIREBASE_PRIVATE_KEY does not appear to be a valid PEM block.\x1b[0m");
    console.error("Ensure it starts with '-----BEGIN PRIVATE KEY-----' and ends with '-----END PRIVATE KEY-----'.\n");
    throw new Error("FIREBASE_PRIVATE_KEY invalid format");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    })
  });
  console.log("Firebase Admin initialized");
} catch (e) {
  console.error("Firebase Admin init error:", e.message);
  throw e;
}

export default admin.firestore();
