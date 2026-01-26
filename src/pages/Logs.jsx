import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import { storage } from '../lib/storage';

export default function Logs() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = storage.getLogs();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div data-testid="logs-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">{t('logs')}</h1>
        <p className="text-sm text-slate-600 mt-2">View all sent payment reminders</p>
      </div>

      <Card className="p-6" data-testid="logs-card">
        {logs.length === 0 ? (
          <div className="text-center py-12" data-testid="empty-state">
            <p className="text-slate-500">No logs yet. Send reminders to see logs here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50"
                data-testid={`log-${log.id}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-slate-900">{log.retailer_name}</h4>
                    <p className="text-xs text-slate-500">
                      {new Date(log.sent_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.status === 'sent' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        log.status === 'sent'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {log.status}
                    </span>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-700">
                      {log.trigger_type}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded p-3 mb-2">
                  <p className="text-sm text-slate-700">{log.message}</p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <span>Amount: ₹{log.total_due.toLocaleString()}</span>
                  <span>Invoices: {log.invoice_count}</span>
                  <span>Language: {log.language.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
