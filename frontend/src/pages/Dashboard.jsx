import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../config/api';
import { Card } from '@/components/ui/card';
import { Users, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
        fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/dashboard-overview/${user.uid}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const statCards = [
    {
      title: t('totalRetailers'),
      value: (stats?.totalRetailers ?? stats?.total_retailers ?? 0),
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: t('totalOutstanding'),
      value: `₹${Number(stats?.totalOutstanding ?? stats?.total_outstanding ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      title: t('totalPaid'),
      value: `₹${Number(stats?.totalPaid ?? stats?.total_paid ?? 0).toLocaleString()}`,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: t('totalUnpaid'),
      value: (stats?.totalUnpaid ?? stats?.total_unpaid ?? 0),
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    {
      title: t('totalOverdue'),
      value: `₹${Number(stats?.totalOverdue ?? stats?.total_overdue ?? 0).toLocaleString()}`,
      icon: AlertCircle,
      color: 'text-red-700',
      bg: 'bg-red-100'
    }
  ];

  return (
    <div data-testid="dashboard-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">{t('dashboard')}</h1>
        <p className="text-sm text-slate-600 mt-2">Overview of your payment tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="p-6" data-testid={`stat-card-${index}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                    {card.title}
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
                </div>
                <div className={`${card.bg} ${card.color} p-3 rounded-md`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
