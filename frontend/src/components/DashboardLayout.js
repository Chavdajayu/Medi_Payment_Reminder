import React from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Upload,
  Users,
  FileText,
  Settings,
  ScrollText,
  LogOut,
  Globe
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function DashboardLayout() {
  const { user, logout, loading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const menuItems = [
    { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { path: '/upload', label: t('upload'), icon: Upload },
    { path: '/retailers', label: t('retailers'), icon: Users },
    { path: '/invoices', label: t('invoices'), icon: FileText },
    { path: '/settings', label: t('settings'), icon: Settings },
    { path: '/logs', label: t('logs'), icon: ScrollText },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-50 flex flex-col" data-testid="sidebar">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold">Medical Distributor</h2>
          <p className="text-xs text-slate-400 mt-1">{user?.business_name}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1" data-testid="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.label.toLowerCase()}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
            onClick={handleLogout}
            data-testid="logout-button"
          >
            <LogOut className="w-5 h-5 mr-3" />
            {t('logout')}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8" data-testid="header">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" data-testid="language-switcher">
                <Globe className="w-4 h-4 mr-2" />
                {language.toUpperCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setLanguage('en')} data-testid="lang-en">English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('hi')} data-testid="lang-hi">हिंदी</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('gu')} data-testid="lang-gu">ગુજરાતી</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8 overflow-auto" data-testid="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
