import express from 'express';
import * as invoicesController from '../controllers/invoices.controller.js';

const router = express.Router();

router.get('/:uid', invoicesController.getInvoices);
router.put('/:uid/:invoiceId', invoicesController.updateInvoice);
router.post('/', invoicesController.createInvoice);

export default router;
