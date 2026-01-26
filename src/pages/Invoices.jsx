import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Invoices() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    invoice_number: '',
    amount: '',
    retailer_name: '',
    retailer_phone: '',
    due_date: ''
  });

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`/api/invoices/${user.uid}`);
      setInvoices(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvoice = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const response = await axios.post('/api/invoices', {
        uid: user.uid,
        ...newInvoice
      });
      setInvoices([response.data, ...invoices]);
      setIsAddOpen(false);
      setNewInvoice({
        invoice_number: '',
        amount: '',
        retailer_name: '',
        retailer_phone: '',
        due_date: ''
      });
      toast.success('Invoice added successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add invoice');
    } finally {
      setAdding(false);
    }
  };

  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      await axios.put(`/api/invoices/${user.uid}/${invoiceId}`, { payment_status: newStatus });
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
        const distributorName = user.displayName || 'Ganesh Pharma'; // Fallback to 'Ganesh Pharma' or user's name
        const message = `Dear ${invoice.retailer_name}, you have ₹${invoice.amount} outstanding for Invoice ${invoice.invoice_number}. Kindly pay by ${invoice.due_date}. - ${distributorName}`;
        await axios.post(`/api/whatsapp/send`, {
            to: invoice.retailer_phone,
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
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">{t('invoices')}</h1>
            <p className="text-sm text-slate-600 mt-2">View and manage all invoices</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Invoice
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
                <DialogHeader>
                    <DialogTitle>Add New Invoice</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddInvoice} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Invoice Number</Label>
                            <Input 
                                value={newInvoice.invoice_number}
                                onChange={e => setNewInvoice({...newInvoice, invoice_number: e.target.value})}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Amount</Label>
                            <Input 
                                type="number"
                                value={newInvoice.amount}
                                onChange={e => setNewInvoice({...newInvoice, amount: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Retailer Name</Label>
                        <Input 
                            value={newInvoice.retailer_name}
                            onChange={e => setNewInvoice({...newInvoice, retailer_name: e.target.value})}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Retailer Phone</Label>
                        <Input 
                            value={newInvoice.retailer_phone}
                            onChange={e => setNewInvoice({...newInvoice, retailer_phone: e.target.value})}
                            placeholder="919876543210"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input 
                            type="date"
                            value={newInvoice.due_date}
                            onChange={e => setNewInvoice({...newInvoice, due_date: e.target.value})}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={adding}>
                            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Invoice'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
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
                  <th className="text-left p-3 font-medium text-slate-500">Actions</th>
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
                      <td className="p-3 text-slate-600">{invoice.retailer_name}</td>
                      <td className="p-3 text-slate-600">{invoice.retailer_phone}</td>
                      <td className="p-3 font-medium text-slate-900">₹{invoice.amount}</td>
                      <td className="p-3 text-slate-600">{invoice.invoice_date}</td>
                      <td className={`p-3 ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                        {invoice.due_date}
                      </td>
                      <td className="p-3">
                        <select 
                            className="border rounded p-1 text-xs"
                            value={invoice.payment_status}
                            onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                        >
                            <option value="unpaid">Unpaid</option>
                            <option value="paid">Paid</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <Button size="sm" variant="outline" onClick={() => sendWhatsAppReminder(invoice)}>
                            Remind
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
