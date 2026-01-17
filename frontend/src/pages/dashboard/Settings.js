import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import useAuthStore from '../../store/authStore';
import { authAPI } from '../../lib/api';
import { toast } from 'sonner';
import { Building2, MapPin, Phone, Bell, Shield, Download, Trash2, Save } from 'lucide-react';

const Settings = () => {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    shopName: user?.shopName || '',
    city: user?.city || '',
    state: user?.state || 'Assam',
    pincode: user?.pincode || ''
  });
  const [loading, setLoading] = useState(false);

  const states = ['Assam', 'Maharashtra', 'Delhi', 'Karnataka', 'West Bengal', 'Tamil Nadu', 'Telangana', 'Gujarat', 'Rajasthan'];

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await authAPI.register(formData);
      updateUser(response.data.user);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save settings');
    }
    setLoading(false);
  };

  const handleExportData = () => {
    toast.info('Data export will be available soon');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.error('Account deletion will be available soon. Please contact support.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6" data-testid="settings-page">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#134252] mb-2">Settings</h2>
          <p className="text-[#626C71]">Manage your shop details, notification preferences, and account security.</p>
        </div>

        {/* Shop Profile */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-[#134252] mb-6">Shop Profile</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#134252] mb-2">
                <Building2 className="inline w-4 h-4 mr-2" />
                Shop Name
              </label>
              <input
                type="text"
                value={formData.shopName}
                onChange={(e) => setFormData({...formData, shopName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent"
                placeholder="Enter shop name"
                data-testid="shop-name-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#134252] mb-2">
                <Phone className="inline w-4 h-4 mr-2" />
                Phone Number
              </label>
              <input
                type="text"
                value={user?.phoneNumber || ''}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-[#626C71]"
                data-testid="phone-number-display"
              />
              <p className="text-xs text-[#626C71] mt-1">Phone number cannot be changed</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#134252] mb-2">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent"
                  placeholder="Enter city"
                  data-testid="city-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#134252] mb-2">State</label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent"
                  data-testid="state-select"
                >
                  {states.map(state => <option key={state} value={state}>{state}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#134252] mb-2">Pincode</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({...formData, pincode: e.target.value.slice(0, 6)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent"
                placeholder="560001"
                data-testid="pincode-input"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-[#34BEE8] text-white py-3 rounded-lg font-semibold hover:bg-[#2BAED8] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              data-testid="save-profile-btn"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-[#134252] mb-6">Subscription</h3>
          
          <div className="flex items-center justify-between p-4 bg-[#F8FCFD] rounded-lg mb-4">
            <div>
              <p className="font-semibold text-[#134252] mb-1">Current Plan</p>
              <p className="text-2xl font-bold text-[#34BEE8]">{user?.subscriptionStatus?.toUpperCase() || 'FREE'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#626C71] mb-1">Monthly Limit</p>
              <p className="text-lg font-semibold text-[#134252]">
                {user?.uploadsUsedThisMonth || 0} / {user?.monthlyUploadLimit || 100}
              </p>
            </div>
          </div>

          {user?.subscriptionStatus === 'free' && (
            <button
              onClick={() => window.location.href = '/pricing'}
              className="w-full bg-gradient-to-r from-[#34BEE8] to-[#00D4FF] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              data-testid="upgrade-subscription-btn"
            >
              Upgrade to Unlimited - ₹250/month (7-day free trial)
            </button>
          )}
        </div>

        {/* Notification Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-[#134252] dark:text-white mb-6">
            <Bell className="inline w-5 h-5 mr-2" />
            Notification Preferences
          </h3>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer p-4 hover:bg-[#F8FCFD] dark:hover:bg-gray-700 rounded-lg transition-colors">
              <div>
                <p className="font-semibold text-[#134252] dark:text-white">Document View Alerts</p>
                <p className="text-sm text-[#626C71] dark:text-gray-400">Get notified when customers view your documents</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-[#34BEE8] rounded focus:ring-2 focus:ring-[#34BEE8]"
                data-testid="order-alerts-toggle"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-4 hover:bg-[#F8FCFD] dark:hover:bg-gray-700 rounded-lg transition-colors">
              <div>
                <p className="font-semibold text-[#134252] dark:text-white">Customer Upload Alerts</p>
                <p className="text-sm text-[#626C71] dark:text-gray-400">Get notified when customers upload documents to your portal</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-[#34BEE8] rounded focus:ring-2 focus:ring-[#34BEE8]"
                data-testid="customer-upload-alerts-toggle"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-4 hover:bg-[#F8FCFD] dark:hover:bg-gray-700 rounded-lg transition-colors">
              <div>
                <p className="font-semibold text-[#134252] dark:text-white">Weekly Digest</p>
                <p className="text-sm text-[#626C71] dark:text-gray-400">Receive weekly summary of your activity</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-[#34BEE8] rounded focus:ring-2 focus:ring-[#34BEE8]"
                data-testid="weekly-digest-toggle"
              />
            </label>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-[#134252] mb-6">
            <Shield className="inline w-5 h-5 mr-2" />
            Privacy & Security
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#F8FCFD] rounded-lg">
              <div>
                <p className="font-semibold text-[#134252] mb-1">Password</p>
                <p className="text-sm text-[#626C71]">Last changed 3 months ago</p>
              </div>
              <button
                onClick={() => toast.info('Password reset will be available soon')}
                className="text-[#34BEE8] font-semibold hover:underline"
                data-testid="reset-password-btn"
              >
                Reset Password
              </button>
            </div>

            <label className="flex items-center justify-between cursor-pointer p-4 hover:bg-[#F8FCFD] rounded-lg transition-colors">
              <div>
                <p className="font-semibold text-[#134252]">Public Visibility</p>
                <p className="text-sm text-[#626C71]">Allow your shop to appear in public leaderboard</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-[#34BEE8] rounded focus:ring-2 focus:ring-[#34BEE8]"
                data-testid="public-visibility-toggle"
              />
            </label>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-[#134252] mb-6">Data Management</h3>
          
          <div className="space-y-4">
            <button
              onClick={handleExportData}
              className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-[#34BEE8] transition-colors"
              data-testid="export-data-btn"
            >
              <div className="text-left">
                <p className="font-semibold text-[#134252]">Download My Data</p>
                <p className="text-sm text-[#626C71]">Export all your data as CSV (GDPR compliant)</p>
              </div>
              <Download className="w-5 h-5 text-[#34BEE8]" />
            </button>

            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-between p-4 border-2 border-red-200 rounded-lg hover:border-red-500 transition-colors"
              data-testid="delete-account-btn"
            >
              <div className="text-left">
                <p className="font-semibold text-red-500">Delete Account</p>
                <p className="text-sm text-[#626C71]">Permanently delete your account and all data</p>
              </div>
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-[#F8FCFD] rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-sm text-[#626C71]">
            Need help? <a href="/contact" className="text-[#34BEE8] font-semibold hover:underline">Contact Support</a>
          </p>
          <p className="text-xs text-[#626C71] mt-2">
            Version 1.0.0 | <a href="#" className="hover:underline">Privacy Policy</a> | <a href="#" className="hover:underline">Terms of Service</a>
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
