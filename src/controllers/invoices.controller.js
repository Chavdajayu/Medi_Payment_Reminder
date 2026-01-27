const db = require('../config/firebase');

exports.getInvoices = async (req, res) => {
  try {
    const snapshot = await db.collection('users').doc(req.params.uid).collection('invoices').get();
    const invoices = [];
    snapshot.forEach(doc => invoices.push({ id: doc.id, ...doc.data() }));
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const { payment_status } = req.body;
    await db.collection('users').doc(req.params.uid).collection('invoices').doc(req.params.invoiceId).update({
      payment_status
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const { uid, invoice_number, retailer_name, retailer_phone, amount, due_date } = req.body;
    
    if (!uid || !invoice_number || !retailer_name || !amount || !due_date) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const newInvoice = {
        invoice_number,
        retailer_name,
        retailer_phone: retailer_phone || '',
        amount: parseFloat(amount),
        due_date,
        invoice_date: new Date().toISOString().split('T')[0],
        payment_status: 'unpaid',
        createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('users').doc(uid).collection('invoices').add(newInvoice);

    res.json({ success: true, id: docRef.id, ...newInvoice });
  } catch (error) {
    console.error("Add Invoice Error:", error);
    res.status(500).json({ error: error.message });
  }
};
