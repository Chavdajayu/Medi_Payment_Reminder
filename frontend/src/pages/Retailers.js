import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { storage } from '../lib/storage';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Retailers() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState({});
  const [sendingAll, setSendingAll] = useState(false);

  useEffect(() => {
    const fetchRetailers = async () => {
      try {
        let data = storage.getRetailers();
        if (search) {
          data = data.filter(r => 
            r.retailer_name.toLowerCase().includes(search.toLowerCase()) || 
            r.retailer_phone.includes(search)
          );
        }
        setRetailers(data);
      } catch (error) {
        console.error('Error fetching retailers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRetailers();
  }, [search]);

  const handleSendReminder = async (retailerId) => {
    const retailer = retailers.find(r => r.id === retailerId);
    if (!retailer) return;

    setSending({ ...sending, [retailerId]: true });
    try {
      const message = `Reminder: You have ${retailer.unpaid_invoice_count} unpaid invoices totaling Rs.${retailer.outstanding_amount}. Earliest due: ${retailer.earliest_due_date}`;
      await axios.post(`${API}/send-whatsapp`, {
        phone: retailer.retailer_phone,
        message: message
      });
      
      storage.addLog({
        retailer_name: retailer.retailer_name,
        status: 'sent',
        trigger_type: 'manual',
        message: message,
        total_due: retailer.outstanding_amount,
        invoice_count: retailer.unpaid_invoice_count,
        language: 'en'
      });
      
      toast.success('Reminder sent successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send reminder');
      storage.addLog({
        retailer_name: retailer.retailer_name,
        status: 'failed',
        trigger_type: 'manual',
        message: 'Failed to send WhatsApp',
        total_due: retailer.outstanding_amount,
        invoice_count: retailer.unpaid_invoice_count,
        language: 'en'
      });
    } finally {
      setSending({ ...sending, [retailerId]: false });
    }
  };

  const handleSendAll = async () => {
    setSendingAll(true);
    let sent = 0;
    let failed = 0;
    
    // Filter retailers with unpaid invoices
    const targetRetailers = retailers.filter(r => r.unpaid_invoice_count > 0);
    
    for (const retailer of targetRetailers) {
      try {
        const message = `Reminder: You have ${retailer.unpaid_invoice_count} unpaid invoices totaling Rs.${retailer.outstanding_amount}. Earliest due: ${retailer.earliest_due_date}`;
        await axios.post(`${API}/send-whatsapp`, {
          phone: retailer.retailer_phone,
          message: message
        });
        sent++;
        storage.addLog({
          retailer_name: retailer.retailer_name,
          status: 'sent',
          trigger_type: 'batch',
          message: message,
          total_due: retailer.outstanding_amount,
          invoice_count: retailer.unpaid_invoice_count,
          language: 'en'
        });
      } catch (error) {
        failed++;
        storage.addLog({
          retailer_name: retailer.retailer_name,
          status: 'failed',
          trigger_type: 'batch',
          message: 'Failed to send WhatsApp',
          total_due: retailer.outstanding_amount,
          invoice_count: retailer.unpaid_invoice_count,
          language: 'en'
        });
      }
    }

    toast.success(`Sent to ${sent} retailers. Failed: ${failed}`);
    setSendingAll(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div data-testid="retailers-page">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">{t('retailers')}</h1>
            <p className="text-sm text-slate-600 mt-2">Manage retailers and send payment reminders</p>
          </div>
          <Button
            onClick={handleSendAll}
            disabled={sendingAll || retailers.length === 0}
            data-testid="send-all-button"
          >
            {sendingAll ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {t('sendAll')}
              </>
            )}
          </Button>
        </div>
      </div>

      <Card className="p-6" data-testid="retailers-card">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={t('search') + ' retailers...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="search-input"
            />
          </div>
        </div>

        {retailers.length === 0 ? (
          <div className="text-center py-12" data-testid="empty-state">
            <p className="text-slate-500">No retailers found. Upload data to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="retailers-table">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-3 font-medium text-slate-500">Name</th>
                  <th className="text-left p-3 font-medium text-slate-500">Phone</th>
                  <th className="text-left p-3 font-medium text-slate-500">Outstanding</th>
                  <th className="text-left p-3 font-medium text-slate-500">Unpaid Invoices</th>
                  <th className="text-left p-3 font-medium text-slate-500">Due Date</th>
                  <th className="text-left p-3 font-medium text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {retailers.map((retailer) => (
                  <tr
                    key={retailer.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                    data-testid={`retailer-row-${retailer.id}`}
                  >
                    <td className="p-3 font-medium text-slate-900">{retailer.retailer_name}</td>
                    <td className="p-3 text-slate-600">{retailer.retailer_phone}</td>
                    <td className="p-3 text-slate-900">
                      ₹{(retailer.outstanding_amount || 0).toLocaleString()}
                    </td>
                    <td className="p-3 text-slate-600">{retailer.unpaid_invoice_count || 0}</td>
                    <td className="p-3 text-slate-600">{retailer.earliest_due_date || '-'}</td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        onClick={() => handleSendReminder(retailer.id)}
                        disabled={sending[retailer.id] || retailer.unpaid_invoice_count === 0}
                        data-testid={`send-button-${retailer.id}`}
                      >
                        {sending[retailer.id] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-1" />
                            {t('sendNow')}
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
