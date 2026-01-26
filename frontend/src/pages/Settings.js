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
import { MessageSquare, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { storage } from '../lib/storage';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Settings() {
  const { token } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [settings, setSettings] = useState(storage.getSettings()); // Initialize directly
  const [loading, setLoading] = useState(false); // No loading needed for local storage
  const [saving, setSaving] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState(null);
  const [qrCode, setQrCode] = useState(null);

  const checkWhatsAppStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/whatsapp/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWhatsappStatus(response.data);
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
      setWhatsappStatus({ status: 'disconnected', error: 'Service unreachable' });
    }
  }, [token]);

  useEffect(() => {
    // fetchSettings(); // No need to fetch async
    checkWhatsAppStatus();
  }, [checkWhatsAppStatus]);

  /* 
  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };
  */

  const handleGetQR = async () => {
    try {
      const response = await axios.get(`${API}/whatsapp/qr`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.qrCode) {
        setQrCode(response.data.qrCode);
        toast.success('QR Code generated. Please scan with WhatsApp.');
      } else if (response.data.status === 'connected') {
        toast.info('WhatsApp is already connected!');
        checkWhatsAppStatus(); // Refresh status
      } else {
        toast.info(response.data.message || 'Connecting...');
      }
    } catch (error) {
      toast.error('Failed to get QR code');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      storage.saveSettings(settings);
      // Also update global language context if changed
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

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  // Guard against null settings (shouldn't happen with storage.getSettings() but good practice)
  if (!settings) { 
      return <div className="text-center py-8">Error loading settings. <Button onClick={() => setSettings(storage.getSettings())}>Retry</Button></div>;
  }

  return (
    <div data-testid="settings-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">{t('settings')}</h1>
        <p className="text-sm text-slate-600 mt-2">Configure reminder settings and WhatsApp connection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WhatsApp Connection */}
        <Card className="p-6" data-testid="whatsapp-card">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-semibold text-slate-900">WhatsApp Connection</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Status:</span>
              <span
                className={`text-sm font-medium ${
                  whatsappStatus?.status === 'connected' ? 'text-green-600' : 'text-orange-600'
                }`}
                data-testid="whatsapp-status"
              >
                {whatsappStatus?.status === 'connected' ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {whatsappStatus?.status !== 'connected' && (
              <Button onClick={handleGetQR} className="w-full" data-testid="get-qr-button">
                <QrCode className="w-4 h-4 mr-2" />
                Get QR Code
              </Button>
            )}

            {qrCode && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg" data-testid="qr-code-display">
                <p className="text-sm text-slate-600 mb-3 text-center">Scan this QR code with WhatsApp</p>
                <img src={qrCode} alt="WhatsApp QR Code" className="mx-auto" />
              </div>
            )}

            <p className="text-xs text-slate-500">
              Connect your WhatsApp account to send automatic payment reminders.
            </p>
          </div>
        </Card>

        {/* Reminder Settings */}
        <Card className="p-6" data-testid="reminder-card">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Reminder Settings</h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="language" data-testid="language-label">Default Language</Label>
              <Select
                value={settings.default_language}
                onValueChange={(value) => {
                  setSettings({ ...settings, default_language: value });
                  setLanguage(value);
                }}
              >
                <SelectTrigger id="language" data-testid="language-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी</SelectItem>
                  <SelectItem value="gu">ગુજરાતી</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="credit_days" data-testid="credit-days-label">Default Credit Days</Label>
              <Input
                id="credit_days"
                type="number"
                value={settings.default_credit_days}
                onChange={(e) => setSettings({ ...settings, default_credit_days: e.target.value })}
                data-testid="credit-days-input"
              />
            </div>

            <div>
              <Label htmlFor="frequency" data-testid="frequency-label">Reminder Frequency</Label>
              <Select
                value={settings.reminder_frequency}
                onValueChange={(value) => setSettings({ ...settings, reminder_frequency: value })}
              >
                <SelectTrigger id="frequency" data-testid="frequency-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="send_time" data-testid="send-time-label">Auto Send Time</Label>
              <Input
                id="send_time"
                type="time"
                value={settings.auto_send_time}
                onChange={(e) => setSettings({ ...settings, auto_send_time: e.target.value })}
                data-testid="send-time-input"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="auto_reminder" data-testid="auto-reminder-label">Enable Auto Reminders</Label>
              <Switch
                id="auto_reminder"
                checked={settings.auto_reminder_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, auto_reminder_enabled: checked })}
                data-testid="auto-reminder-switch"
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full" data-testid="save-settings-button">
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
