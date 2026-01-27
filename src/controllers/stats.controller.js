const db = require('../config/firebase');

exports.getStats = async (req, res) => {
  try {
    const snapshot = await db.collection('users').doc(req.params.uid).collection('invoices').get();
    
    let total_retailers = new Set();
    let total_outstanding = 0;
    let total_paid = 0;
    let total_unpaid = 0;
    let total_overdue = 0;
    
    const today = new Date();

    snapshot.forEach(doc => {
      const data = doc.data();
      total_retailers.add(data.retailer_name);
      
      const amount = parseFloat(data.amount || 0);
      
      if (data.payment_status === 'paid') {
        total_paid += amount;
      } else {
        total_unpaid += 1;
        total_outstanding += amount;
        
        if (new Date(data.due_date) < today) {
          total_overdue += amount;
        }
      }
    });

    res.json({
      total_retailers: total_retailers.size,
      total_outstanding,
      total_paid,
      total_unpaid,
      total_overdue
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
