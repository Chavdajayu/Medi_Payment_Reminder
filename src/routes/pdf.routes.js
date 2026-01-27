import express from 'express';
import multer from 'multer';
import * as pdfController from '../controllers/pdf.controller.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), pdfController.uploadPdf);

export default router;
