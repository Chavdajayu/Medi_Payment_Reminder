const fs = require('fs');
const { parseFile } = require('../services/pdf.service');

exports.uploadPdf = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const uid = req.body.uid;
  if (!uid) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(401).json({ error: "Unauthorized: Missing UID" });
  }

  try {
    const invoices = await parseFile(req.file.path, req.file.mimetype);
    
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    res.json({ success: true, count: invoices.length, invoices });
  } catch (error) {
    console.error("Upload Error:", error);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: error.message });
  }
};
