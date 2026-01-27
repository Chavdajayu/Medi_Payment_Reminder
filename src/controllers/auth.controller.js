const db = require('../config/firebase');
const admin = require('firebase-admin');

exports.register = async (req, res) => {
  try {
    const { name, email, password, businessName, whatsappNumber } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    // 1. Create user in Firebase Authentication
    let userRecord;
    try {
      userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name || '',
      });
    } catch (authError) {
      return res.status(400).json({ error: "Auth Error: " + authError.message });
    }

    // 2. Save user profile to Firestore
    const userData = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: name || '',
      businessName: businessName || '',
      whatsappNumber: whatsappNumber || '',
      createdAt: new Date().toISOString()
    };

    await db.collection('users').doc(userRecord.uid).set(userData, { merge: true });

    res.status(201).json({ 
      success: true, 
      message: "User registered successfully", 
      user: userData 
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
};

exports.syncUser = async (req, res) => {
  try {
    const { uid, email, businessName } = req.body;
    
    if (!uid || !email) {
      return res.status(400).json({ error: "Missing uid or email" });
    }

    await db.collection('users').doc(uid).set({
      uid,
      email,
      businessName: businessName || '',
      createdAt: new Date().toISOString()
    }, { merge: true });

    res.json({ success: true, message: "User profile synced" });
  } catch (error) {
    console.error("Auth Sync Error:", error);
    res.status(500).json({ error: "Failed to sync user profile" });
  }
};
