import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Send, Search, Loader2, Plus, Phone } from 'lucide-react';
import { toast } from 'sonner';

export default function Retailers() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState({});
  const [sendingAll, setSendingAll] = useState(false);
  
  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newRetailer, setNewRetailer] = useState({ name: '', phone: '' });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (user) {
        fetchRetailers();
    }
  }, [user]);

  const fetchRetailers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/retailers/${user.uid}`);
      // Ensure response.data is an array
      setRetailers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching retailers:', error);
      toast.error('Failed to load retailers');
      setRetailers([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  const handleAddRetailer = async (e) => {
    e.preventDefault();
    if (!newRetailer.name) return;
    
    setAdding(true);
    try {
      await axios.post(`${API_URL}/api/retailers`, {
        uid: user.uid,
        retailer_name: newRetailer.name,
        retailer_phone: newRetailer.phone
      });
      toast.success('Retailer added successfully');
      setNewRetailer({ name: '', phone: '' });
      setIsAddOpen(false);
      fetchRetailers(); // Refresh list
    } catch (error) {
      toast.error('Failed to add retailer');
    } finally {
      setAdding(false);
    }
  };

  const filteredRetailers = (retailers || []).filter(r => 
    (r.retailer_name || '').toLowerCase().includes(search.toLowerCase()) || 
    (r.retailer_phone || '').includes(search)
  );

  const handleSendReminder = async (retailer) => {
    setSending({ ...sending, [retailer.id]: true });
    try {
      const distributorName = user.displayName || 'Ganesh Pharma';
      const dueDate = retailer.earliest_due_date ? new Date(retailer.earliest_due_date).toLocaleDateString() : 'Immediate';
      const message = `Dear ${retailer.retailer_name}, you have ₹${retailer.outstanding_amount} outstanding across ${retailer.unpaid_invoice_count} invoices. Kindly pay by ${dueDate}. - ${distributorName}`;
      await axios.post(`${API_URL}/api/whatsapp/send`, {
        to: retailer.retailer_phone,
        message: message
      });
      
      toast.success('Reminder sent successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send reminder');
    } finally {
      setSending({ ...sending, [retailer.id]: false });
    }
  };

  const handleSendAll = async () => {
    setSendingAll(true);
    let sent = 0;
    
    // Filter retailers with unpaid invoices
    const targetRetailers = filteredRetailers.filter(r => r.unpaid_invoice_count > 0);
    const distributorName = user.displayName || 'Ganesh Pharma';
    
    for (const retailer of targetRetailers) {
      try {
        const dueDate = retailer.earliest_due_date ? new Date(retailer.earliest_due_date).toLocaleDateString() : 'Immediate';
        const message = `Dear ${retailer.retailer_name}, you have ₹${retailer.outstanding_amount} outstanding across ${retailer.unpaid_invoice_count} invoices. Kindly pay by ${dueDate}. - ${distributorName}`;
        await axios.post(`/api/whatsapp/send`, {
            to: retailer.retailer_phone,
            message: message
        });
        sent++;
        await new Promise(r => setTimeout(r, 1000));
      } catch (error) {
        console.error(`Failed to send to ${retailer.retailer_name}`);
      }
    }
    
    toast.success(`Sent reminders to ${sent} retailers`);
    setSendingAll(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t('retailers')}</h1>
          <p className="text-sm text-slate-600 mt-2">Manage retailer communications</p>
        </div>
        
        <div className="flex gap-2">
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Retailer
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>Add New Retailer</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddRetailer} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Retailer Name</Label>
                            <Input 
                                value={newRetailer.name} 
                                onChange={e => setNewRetailer({...newRetailer, name: e.target.value})}
                                placeholder="Enter retailer name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input 
                                value={newRetailer.phone} 
                                onChange={e => setNewRetailer({...newRetailer, phone: e.target.value})}
                                placeholder="919876543210"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Unpaid Count</Label>
                                <Input 
                                    type="number"
                                    min="0"
                                    value={newRetailer.unpaid_invoice_count} 
                                    onChange={e => setNewRetailer({...newRetailer, unpaid_invoice_count: e.target.value})}
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Outstanding Amount</Label>
                                <Input 
                                    type="number"
                                    min="0"
                                    value={newRetailer.outstanding_amount} 
                                    onChange={e => setNewRetailer({...newRetailer, outstanding_amount: e.target.value})}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={adding}>
                                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Retailer'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {filteredRetailers.some(r => r.unpaid_invoice_count > 0) && (
            <Button onClick={handleSendAll} disabled={sendingAll} variant="secondary">
                {sendingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Send All Reminders
            </Button>
            )}
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search retailers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRetailers.map((retailer) => (
          <Card key={retailer.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{retailer.retailer_name}</h3>
                <div className="flex items-center text-slate-500 text-sm mt-1">
                  <Phone className="h-3 w-3 mr-1" />
                  {retailer.retailer_phone || 'No phone'}
                </div>
              </div>
              {retailer.is_manual && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Manual</span>
              )}
            </div>
            
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Unpaid Invoices</span>
                <span className="font-medium">{retailer.unpaid_invoice_count}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Outstanding Amount</span>
                <span className="font-medium text-red-600">Rs. {retailer.outstanding_amount.toLocaleString()}</span>
              </div>
              {retailer.earliest_due_date && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Earliest Due</span>
                  <span className="font-medium">{new Date(retailer.earliest_due_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <Button 
              className="w-full" 
              onClick={() => handleSendReminder(retailer)}
              disabled={sending[retailer.id] || !retailer.retailer_phone || retailer.unpaid_invoice_count === 0}
            >
              {sending[retailer.id] ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Reminder
                </>
              )}
            </Button>
          </Card>
        ))}
        
        {filteredRetailers.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            No retailers found. Upload invoices or add one manually.
          </div>
        )}
      </div>
    </div>
  );
}
