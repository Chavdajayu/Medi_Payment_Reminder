const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { parseFile } = require('../server-lib/uploadParser');
const { v4: uuidv4 } = require('uuid');

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const uid = req.body.uid;
  if (!uid) {
    // Cleanup
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(401).json({ error: "Unauthorized: Missing UID" });
  }

  try {
    const invoices = await parseFile(req.file.path, req.file.mimetype);
    
    // Cleanup
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    // Return parsed invoices to frontend for saving (Client SDK Auth)
    res.json({ success: true, count: invoices.length, invoices });
  } catch (error) {
    console.error("Upload Error:", error);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
