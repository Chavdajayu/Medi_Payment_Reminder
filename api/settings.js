const express = require('express');
const router = express.Router();
const { db } = require('../server-lib/firebaseAdmin');

router.post('/', async (req, res) => {
  const { uid, settings } = req.body;
  try {
    await db.collection('users').doc(uid).set({ settings }, { merge: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:uid', async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.params.uid).get();
    if (doc.exists && doc.data().settings) {
      res.json(doc.data().settings);
    } else {
      res.json({});
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
