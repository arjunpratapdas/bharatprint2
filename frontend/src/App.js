import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ClerkProvider } from '@clerk/clerk-react';
import useAuthStore from './store/authStore';
import { ThemeProvider } from './contexts/ThemeContext';
import { clerPublishableKey } from './lib/clerk';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/dashboard/Dashboard';
import UploadDocument from './pages/dashboard/UploadDocument';
import Documents from './pages/dashboard/Documents';
import Settings from './pages/dashboard/Settings';
import Checkout from './pages/dashboard/Checkout';
import PublicView from './pages/PublicView';
import Pricing from './pages/Pricing';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import CustomerUpload from './pages/CustomerUpload';

import './App.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/auth/login" />;
};

function App() {
  if (!clerPublishableKey) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-red-100">
        <div className="bg-red-600 text-white p-8 rounded-lg">
          <h1 className="text-2xl font-bold mb-4">Configuration Error</h1>
          <p className="mb-2">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set</p>
          <p className="text-sm">Please check your .env.local file</p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerPublishableKey}>
      <ThemeProvider>
        <div className="App min-h-screen bg-white dark:bg-gray-900 text-[#134252] dark:text-gray-100 transition-colors">
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/signup" element={<Signup />} />
              <Route path="/view/:shareLink" element={<PublicView />} />
              <Route path="/upload/:merchantCode" element={<CustomerUpload />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard/upload" element={<ProtectedRoute><UploadDocument /></ProtectedRoute>} />
              <Route path="/dashboard/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/dashboard/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" richColors />
        </div>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;