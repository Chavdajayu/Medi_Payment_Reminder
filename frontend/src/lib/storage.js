// LocalStorage Management for "No Database" Mode

const STORAGE_KEYS = {
  USER: 'mpr_user',
  TOKEN: 'mpr_token',
  INVOICES: 'mpr_invoices',
  RETAILERS: 'mpr_retailers',
  LOGS: 'mpr_logs',
  SETTINGS: 'mpr_settings'
};

// --- User & Auth ---
export const storage = {
  getUser: () => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  saveUser: (user) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    // Create a mock token
    localStorage.setItem(STORAGE_KEYS.TOKEN, 'mock-jwt-token-local-mode');
  },

  removeUser: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  getToken: () => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  // --- Invoices ---
  getInvoices: () => {
    const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return data ? JSON.parse(data) : [];
  },

  saveInvoice: (invoice) => {
    const invoices = storage.getInvoices();
    const newInvoice = { ...invoice, id: Date.now().toString(), created_at: new Date().toISOString() };
    invoices.push(newInvoice);
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    return newInvoice;
  },

  updateInvoice: (id, updates) => {
    const invoices = storage.getInvoices();
    const index = invoices.findIndex(inv => inv.id === id);
    if (index !== -1) {
      invoices[index] = { ...invoices[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
      return invoices[index];
    }
    return null;
  },

  deleteInvoice: (id) => {
    const invoices = storage.getInvoices();
    const filtered = invoices.filter(inv => inv.id !== id);
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(filtered));
  },

  // --- Retailers ---
  getRetailers: () => {
    // Dynamically calculate retailers from invoices to ensure consistency
    const invoices = storage.getInvoices();
    const retailerMap = new Map();

    invoices.forEach(inv => {
      // Normalize retailer name for grouping
      const name = inv.retailer_name || 'Unknown Retailer';
      const key = name.toLowerCase();

      if (!retailerMap.has(key)) {
        retailerMap.set(key, {
          id: key, // Use name as ID for now or generate one
          retailer_name: name,
          retailer_phone: inv.retailer_phone || '',
          outstanding_amount: 0,
          unpaid_invoice_count: 0,
          earliest_due_date: null,
          invoices: []
        });
      }

      const retailer = retailerMap.get(key);
      retailer.invoices.push(inv);

      // Update phone if missing
      if (!retailer.retailer_phone && inv.retailer_phone) {
        retailer.retailer_phone = inv.retailer_phone;
      }

      if (inv.payment_status === 'unpaid') {
        retailer.outstanding_amount += parseFloat(inv.amount || 0);
        retailer.unpaid_invoice_count += 1;
        
        // Track earliest due date
        if (inv.due_date) {
          if (!retailer.earliest_due_date || new Date(inv.due_date) < new Date(retailer.earliest_due_date)) {
            retailer.earliest_due_date = inv.due_date;
          }
        }
      }
    });

    return Array.from(retailerMap.values());
  },

  saveRetailer: (retailer) => {
    // In this derived model, saving a retailer might just update their phone in a separate store
    // or we just rely on invoice data. For now, we'll keep the separate store if needed,
    // but getRetailers relies on invoices. 
    // If we want to support editing retailer details independent of invoices, we need a separate store.
    // Let's store overrides in RETAILERS key.
    const retailers = JSON.parse(localStorage.getItem(STORAGE_KEYS.RETAILERS) || '[]');
    const existingIndex = retailers.findIndex(r => r.retailer_name === retailer.retailer_name);
    
    if (existingIndex >= 0) {
      retailers[existingIndex] = { ...retailers[existingIndex], ...retailer };
    } else {
      retailers.push(retailer);
    }
    localStorage.setItem(STORAGE_KEYS.RETAILERS, JSON.stringify(retailers));
    return retailer;
  },

  // --- Logs ---
  getLogs: () => {
    const data = localStorage.getItem(STORAGE_KEYS.LOGS);
    return data ? JSON.parse(data) : [];
  },

  addLog: (log) => {
    const logs = storage.getLogs();
    const newLog = { ...log, id: Date.now().toString(), timestamp: new Date().toISOString() };
    logs.unshift(newLog); // Add to beginning
    // Keep only last 100 logs
    if (logs.length > 100) logs.pop();
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    return newLog;
  },

  // --- Settings ---
  getSettings: () => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const defaults = {
      default_language: 'en',
      default_credit_days: 30,
      reminder_frequency: 'weekly',
      auto_reminder_enabled: false,
      auto_send_time: '09:00'
    };
    return data ? { ...defaults, ...JSON.parse(data) } : defaults;
  },

  saveSettings: (settings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return settings;
  },

  // --- Dashboard Stats ---
  getDashboardStats: () => {
    const invoices = storage.getInvoices();
    const retailers = storage.getRetailers();
    
    const total_outstanding = invoices
      .filter(inv => inv.payment_status === 'unpaid')
      .reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
      
    const total_paid = invoices
      .filter(inv => inv.payment_status === 'paid')
      .reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);

    const total_unpaid = invoices.filter(inv => inv.payment_status === 'unpaid').length;

    const total_overdue = invoices
      .filter(inv => inv.payment_status === 'unpaid' && new Date(inv.due_date) < new Date())
      .reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);

    return {
      total_retailers: retailers.length,
      total_outstanding,
      total_paid,
      total_unpaid,
      total_overdue,
      recent_activity: storage.getLogs().slice(0, 5)
    };
  }
};
