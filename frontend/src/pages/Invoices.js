import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { storage } from '../lib/storage';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Invoices() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const data = storage.getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      storage.updateInvoice(invoiceId, { payment_status: newStatus });
      setInvoices(invoices.map(inv => 
        inv.id === invoiceId ? { ...inv, payment_status: newStatus } : inv
      ));
      toast.success('Invoice updated successfully');
    } catch (error) {
      toast.error('Failed to update invoice');
    }
  };

  const sendWhatsAppReminder = async (invoice) => {
    try {
        const message = `Reminder: Invoice ${invoice.invoice_number} for Rs.${invoice.amount} is due on ${invoice.due_date}.`;
        const response = await axios.post(`${API}/send-whatsapp`, {
            phone: invoice.retailer_phone,
            message: message
        });
        toast.success('WhatsApp reminder sent!');
    } catch (error) {
        console.error("WhatsApp error", error);
        toast.error('Failed to send WhatsApp reminder');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }


  return (
    <div data-testid="invoices-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">{t('invoices')}</h1>
        <p className="text-sm text-slate-600 mt-2">View and manage all invoices</p>
      </div>

      <Card className="p-6" data-testid="invoices-card">
        {invoices.length === 0 ? (
          <div className="text-center py-12" data-testid="empty-state">
            <p className="text-slate-500">No invoices found. Upload data to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="invoices-table">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-3 font-medium text-slate-500">Invoice #</th>
                  <th className="text-left p-3 font-medium text-slate-500">Retailer</th>
                  <th className="text-left p-3 font-medium text-slate-500">Phone</th>
                  <th className="text-left p-3 font-medium text-slate-500">Amount</th>
                  <th className="text-left p-3 font-medium text-slate-500">Invoice Date</th>
                  <th className="text-left p-3 font-medium text-slate-500">Due Date</th>
                  <th className="text-left p-3 font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const isOverdue = new Date(invoice.due_date) < new Date() && invoice.payment_status === 'unpaid';
                  return (
                    <tr
                      key={invoice.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                      data-testid={`invoice-row-${invoice.id}`}
                    >
                      <td className="p-3 font-medium text-slate-900">{invoice.invoice_number}</td>
                      <td className="p-3 text-slate-700">{invoice.retailer_name || '-'}</td>
                      <td className="p-3 text-slate-600">{invoice.retailer_phone || '-'}</td>
                      <td className="p-3 text-slate-900">₹{invoice.amount.toLocaleString()}</td>
                      <td className="p-3 text-slate-600">{invoice.invoice_date}</td>
                      <td className={`p-3 ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                        {invoice.due_date}
                      </td>
                      <td className="p-3">
                        <select
                          value={invoice.payment_status}
                          onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                          className={`border rounded px-2 py-1 text-sm ${
                            invoice.payment_status === 'paid'
                              ? 'border-green-200 bg-green-50 text-green-700'
                              : 'border-red-200 bg-red-50 text-red-700'
                          }`}
                          data-testid={`invoice-status-${invoice.id}`}
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="paid">Paid</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => sendWhatsAppReminder(invoice)}
                        >
                          Send Reminder
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
