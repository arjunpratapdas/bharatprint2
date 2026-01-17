import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { dashboardAPI } from '../../lib/api';
import { FileText, TrendingUp, Upload, QrCode, Clock, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useAuthStore from '../../store/authStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await dashboardAPI.getStats();
        setStats(statsRes.data.stats);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#34BEE8]" />
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    {
      icon: <FileText className="w-6 h-6" />,
      label: 'Documents This Month',
      value: stats?.documents?.thisMonth || 0,
      bgColor: 'from-blue-500 to-blue-600'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: 'Total Documents',
      value: stats?.documents?.totalUploaded || 0,
      bgColor: 'from-purple-500 to-purple-600'
    },
    {
      icon: <Eye className="w-6 h-6" />,
      label: 'Total Views',
      value: stats?.documents?.totalViews || 0,
      bgColor: 'from-green-500 to-green-600'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      label: 'This Week',
      value: stats?.documents?.thisWeek || 0,
      bgColor: 'from-orange-500 to-orange-600'
    }
  ];

  // Mock data for charts
  const uploadData = [
    { month: 'Week 1', uploads: 12 },
    { month: 'Week 2', uploads: 19 },
    { month: 'Week 3', uploads: 15 },
    { month: 'Week 4', uploads: 22 }
  ];

  // Generate merchant code for QR
  const merchantCode = user?.referralCode || 'BP_DEMO1234';

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="dashboard-page">
        {/* Trial Banner */}
        {user?.subscriptionStatus === 'trial' && (
          <div className="bg-gradient-to-r from-[#34BEE8] to-[#00D4FF] rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg">You're on the 7-Day Free Trial!</p>
                <p className="text-white/90 text-sm">Enjoy unlimited documents. Your trial ends on {new Date(user?.trialEndsAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => navigate('/pricing')}
                className="bg-white text-[#34BEE8] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden" data-testid={`stat-card-${idx}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.bgColor} flex items-center justify-center text-white`}>
                    {card.icon}
                  </div>
                </div>
                <p className="text-[#626C71] dark:text-gray-400 text-sm mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-[#134252] dark:text-white">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/dashboard/upload')}
            className="bg-gradient-to-br from-[#34BEE8] to-[#00D4FF] rounded-xl p-8 text-white text-left hover:shadow-xl transition-all"
            data-testid="quick-action-upload"
          >
            <Upload className="w-10 h-10 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Upload Document</h3>
            <p className="text-white/90">Secure file sharing with auto-delete</p>
          </button>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <QrCode className="w-10 h-10 text-[#34BEE8] mb-4" />
                <h3 className="text-2xl font-bold text-[#134252] dark:text-white mb-2">Customer Upload Portal</h3>
                <p className="text-[#626C71] dark:text-gray-400 mb-4">Share this link with customers to receive files</p>
                <div className="bg-[#F8FCFD] dark:bg-gray-700 px-4 py-2 rounded-lg inline-block">
                  <code className="text-sm text-[#34BEE8] font-mono">/upload/{merchantCode}</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-[#134252] dark:text-white mb-4">Document Uploads - Last 30 Days</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={uploadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="uploads" stroke="#34BEE8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-[#134252] dark:text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-[#F8FCFD] dark:bg-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-[#134252] dark:text-white">Document uploaded</p>
                  <p className="text-sm text-[#626C71] dark:text-gray-400">Just now</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-[#F8FCFD] dark:bg-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-[#134252] dark:text-white">Document viewed</p>
                  <p className="text-sm text-[#626C71] dark:text-gray-400">2 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#134252] dark:text-white">Monthly Usage</h3>
            <span className="text-sm font-semibold text-[#34BEE8] px-3 py-1 bg-[#F8FCFD] dark:bg-gray-700 rounded-full">
              {stats?.subscription?.plan?.toUpperCase() || 'FREE'} PLAN
            </span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#626C71] dark:text-gray-400">Documents Uploaded</span>
                <span className="text-sm font-semibold text-[#134252] dark:text-white">
                  {stats?.subscription?.used || 0} / {stats?.subscription?.monthlyLimit || 20}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-[#34BEE8] to-[#00D4FF] h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(((stats?.subscription?.used || 0) / (stats?.subscription?.monthlyLimit || 20)) * 100, 100)}%` }}
                />
              </div>
            </div>
            {stats?.subscription?.plan === 'free' && (
              <button
                onClick={() => navigate('/pricing')}
                className="w-full bg-[#34BEE8] text-white py-3 rounded-lg font-semibold hover:bg-[#2BAED8] transition-colors"
                data-testid="upgrade-plan-btn"
              >
                Upgrade to Unlimited - Start 7-Day Free Trial
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
