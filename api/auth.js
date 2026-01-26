const express = require('express');
const router = express.Router();
const { db } = require('../server-lib/firebaseAdmin');

// Sync user data after Firebase Auth signup on frontend
router.post('/sync-user', async (req, res) => {
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
});

module.exports = router;
