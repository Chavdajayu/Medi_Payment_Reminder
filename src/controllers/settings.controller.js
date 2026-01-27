import db from '../config/firebase.js';

export const updateSettings = async (req, res) => {
  const { uid, settings } = req.body;
  try {
    await db.collection('users').doc(uid).set({ settings }, { merge: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSettings = async (req, res) => {
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
};
