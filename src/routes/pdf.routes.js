const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfController = require('../controllers/pdf.controller');

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), pdfController.uploadPdf);

module.exports = router;
