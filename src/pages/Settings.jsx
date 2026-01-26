import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquare, QrCode, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [settings, setSettings] = useState({
    default_language: 'en',
    auto_reminder_enabled: false,
    reminder_time: '09:00',
    reminder_frequency: 'weekly'
  });
  const [saving, setSaving] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState('DISCONNECTED');
  const [qrCode, setQrCode] = useState(null);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`/api/settings/${user.uid}`);
      if (res.data) setSettings(prev => ({ ...prev, ...res.data }));
    } catch (error) {
      console.error("Failed to fetch settings", error);
    }
  }, [user]);

  const handleGetQR = useCallback(async () => {
    try {
      const response = await axios.get('/api/whatsapp/qr');
      if (response.data.qr) {
        setQrCode(response.data.qr);
        toast.success('Scan the QR code with WhatsApp');
      } else {
        toast.info(response.data.error || 'Check status');
      }
    } catch (error) {
      toast.error('Failed to get QR code');
    }
  }, []);

  const checkWhatsAppStatus = useCallback(async () => {
    try {
      const response = await axios.get('/api/whatsapp/status');
      setWhatsappStatus(response.data.status);
      if (response.data.status === 'CONNECTED') {
        setQrCode(null);
      } else if (response.data.status === 'QR_READY' && !qrCode) {
         handleGetQR();
      }
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
      setWhatsappStatus('ERROR');
    }
  }, [qrCode, handleGetQR]);

  useEffect(() => {
    fetchSettings();
    checkWhatsAppStatus();
    
    // Poll status if QR is displayed or connecting
    const interval = setInterval(() => {
        checkWhatsAppStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchSettings, checkWhatsAppStatus]);

  const handleReset = async () => {
    try {
      await axios.post('/api/whatsapp/reset');
      setWhatsappStatus('DISCONNECTED');
      setQrCode(null);
      toast.success('Connection reset');
    } catch (error) {
      toast.error('Failed to reset connection');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post('/api/settings', {
        uid: user.uid,
        settings
      });
      
      if (settings.default_language !== language) {
        setLanguage(settings.default_language);
      }
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="grid gap-8">
        {/* WhatsApp Connection Section */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-3 rounded-full ${whatsappStatus === 'CONNECTED' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">WhatsApp Connection</h2>
              <p className="text-sm text-slate-500">Status: <span className="font-medium">{whatsappStatus}</span></p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto" onClick={checkWhatsAppStatus}>
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button variant="destructive" size="sm" onClick={handleReset}>
                Reset Connection
            </Button>
          </div>

          {whatsappStatus !== 'CONNECTED' && (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-slate-50">
              {qrCode ? (
                <div className="text-center">
                  <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64 mx-auto mb-4 border bg-white p-2 rounded" />
                  <p className="text-sm text-slate-600">Open WhatsApp &gt; Linked Devices &gt; Link a Device</p>
                </div>
              ) : (
                <div className="text-center">
                  <QrCode className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <Button onClick={handleGetQR}>Generate QR Code</Button>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* General Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Preferences</h2>
          <div className="space-y-6">
            <div className="grid gap-2">
              <Label>Language</Label>
              <Select 
                value={settings.default_language} 
                onValueChange={(val) => setSettings({...settings, default_language: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="gu">Gujarati</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Reminders</Label>
                <p className="text-sm text-slate-500">Automatically send WhatsApp reminders for due invoices</p>
              </div>
              <Switch 
                checked={settings.auto_reminder_enabled}
                onCheckedChange={(checked) => setSettings({...settings, auto_reminder_enabled: checked})}
              />
            </div>

            {settings.auto_reminder_enabled && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Time</Label>
                        <Input 
                            type="time" 
                            value={settings.reminder_time}
                            onChange={(e) => setSettings({...settings, reminder_time: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Frequency</Label>
                        <Select 
                            value={settings.reminder_frequency} 
                            onValueChange={(val) => setSettings({...settings, reminder_frequency: val})}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
