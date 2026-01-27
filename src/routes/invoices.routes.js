const express = require('express');
const router = express.Router();
const invoicesController = require('../controllers/invoices.controller');

router.get('/:uid', invoicesController.getInvoices);
router.put('/:uid/:invoiceId', invoicesController.updateInvoice);
router.post('/', invoicesController.createInvoice);

module.exports = router;
