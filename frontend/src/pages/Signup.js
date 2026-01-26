import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    business_name: '',
    owner_name: '',
    whatsapp_number: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(formData);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">{t('createAccount')}</h1>
            <p className="text-sm text-slate-600">Start managing your payment reminders</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business_name" data-testid="signup-businessname-label">{t('businessName')}</Label>
              <Input
                id="business_name"
                data-testid="signup-businessname-input"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_name" data-testid="signup-ownername-label">{t('ownerName')}</Label>
              <Input
                id="owner_name"
                data-testid="signup-ownername-input"
                value={formData.owner_name}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp_number" data-testid="signup-whatsapp-label">{t('whatsappNumber')}</Label>
              <Input
                id="whatsapp_number"
                data-testid="signup-whatsapp-input"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                placeholder="9876543210"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" data-testid="signup-email-label">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                data-testid="signup-email-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" data-testid="signup-password-label">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                data-testid="signup-password-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading} data-testid="signup-submit-button">
              <UserPlus className="w-4 h-4 mr-2" />
              {loading ? 'Creating account...' : t('signup')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline" data-testid="login-link">
              {t('login')}
            </Link>
          </p>
        </div>
      </div>

      <div 
        className="hidden lg:block flex-1 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1573207535342-8c0f9506112e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwd2FyZWhvdXNlJTIwbG9naXN0aWNzfGVufDB8fHx8MTc2OTMzMDE0MXww&ixlib=rb-4.1.0&q=85')" }}
      >
        <div className="h-full bg-slate-900/60 flex items-center justify-center p-12">
          <div className="text-white">
            <h2 className="text-5xl font-bold mb-4">Medical Distributor</h2>
            <p className="text-xl text-slate-200">Automated Payment Reminders via WhatsApp</p>
          </div>
        </div>
      </div>
    </div>
  );
}
