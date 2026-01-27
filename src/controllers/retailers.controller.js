import db from '../config/firebase.js';

export const getRetailers = async (req, res) => {
  try {
    const retailersMap = new Map();

    const manualSnapshot = await db.collection('users').doc(req.params.uid).collection('retailers').get();
    manualSnapshot.forEach(doc => {
      const data = doc.data();
      retailersMap.set(data.retailer_name, {
        id: doc.id,
        retailer_name: data.retailer_name,
        retailer_phone: data.retailer_phone,
        unpaid_invoice_count: data.unpaid_invoice_count || 0,
        outstanding_amount: data.outstanding_amount || 0,
        earliest_due_date: data.earliest_due_date || null,
        is_manual: true
      });
    });

    const invoicesSnapshot = await db.collection('users').doc(req.params.uid).collection('invoices').get();

    invoicesSnapshot.forEach(doc => {
      const data = doc.data();
      const retailerName = data.retailer_name || data.buyerName || 'Unknown';
      const retailerPhone = data.retailer_phone || data.phoneNumber || '';

      if (!retailersMap.has(retailerName)) {
        retailersMap.set(retailerName, {
          id: retailerName,
          retailer_name: retailerName,
          retailer_phone: retailerPhone,
          unpaid_invoice_count: 0,
          outstanding_amount: 0,
          earliest_due_date: null,
          is_manual: false
        });
      }

      const retailer = retailersMap.get(retailerName);
      
      if (!retailer.retailer_phone && retailerPhone) {
        retailer.retailer_phone = retailerPhone;
      }

      if (data.payment_status === 'unpaid' || data.status === 'unpaid') {
        retailer.unpaid_invoice_count += 1;
        retailer.outstanding_amount += parseFloat(data.amount || 0);
        
        if (!retailer.earliest_due_date || (data.due_date && new Date(data.due_date) < new Date(retailer.earliest_due_date))) {
          retailer.earliest_due_date = data.due_date || data.dueDate;
        }
      }
    });

    res.json(Array.from(retailersMap.values()));
  } catch (error) {
    console.error("Fetch Retailers Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const createRetailer = async (req, res) => {
  try {
    const { uid, retailer_name, retailer_phone, unpaid_invoice_count, outstanding_amount } = req.body;
    
    if (!uid || !retailer_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newRetailer = {
      retailer_name,
      retailer_phone: retailer_phone || '',
      unpaid_invoice_count: parseInt(unpaid_invoice_count || 0),
      outstanding_amount: parseFloat(outstanding_amount || 0),
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('users').doc(uid).collection('retailers').add(newRetailer);

    res.json({ success: true, id: docRef.id, ...newRetailer });
  } catch (error) {
    console.error("Add Retailer Error:", error);
    res.status(500).json({ error: error.message });
  }
};
