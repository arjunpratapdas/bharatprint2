import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { LayoutDashboard, FileText, Gift, TrendingUp, Settings, LogOut, Upload } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
    { icon: <FileText className="w-5 h-5" />, label: 'Documents', path: '/dashboard/documents' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/dashboard/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors" data-testid="dashboard-layout">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <Logo size="md" />
            <span className="text-xl font-bold text-[#134252] dark:text-white">BharatPrint</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-[#34BEE8] text-white'
                      : 'text-[#626C71] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm font-semibold text-[#134252] dark:text-white" data-testid="user-shop-name">{user?.shopName || 'My Shop'}</p>
            <p className="text-xs text-[#626C71] dark:text-gray-400" data-testid="user-phone">{user?.phoneNumber}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            data-testid="logout-btn"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#134252] dark:text-white" data-testid="page-title">
                {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={() => navigate('/dashboard/upload')}
                className="bg-[#34BEE8] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#2BAED8] transition-colors flex items-center gap-2"
                data-testid="upload-document-btn"
              >
                <Upload className="w-5 h-5" />
                Upload Document
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;