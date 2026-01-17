import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, MessageCircle } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4" data-testid="not-found-page">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="text-9xl font-extrabold text-[#34BEE8] mb-4">404</div>
          <h1 className="text-4xl font-bold text-[#134252] mb-4">Page not found</h1>
          <p className="text-lg text-[#626C71] mb-8">
            Oops! It seems the document you are looking for has been moved, deleted, or possibly jammed in the printer.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center justify-center gap-2 bg-[#34BEE8] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2BAED8] transition-colors"
            data-testid="return-dashboard-btn"
          >
            <Home className="w-5 h-5" />
            Return to Dashboard
          </button>
          <button
            onClick={() => navigate('/contact')}
            className="inline-flex items-center justify-center gap-2 bg-white text-[#134252] px-6 py-3 rounded-lg font-semibold border-2 border-gray-200 hover:bg-gray-50 transition-colors"
            data-testid="contact-support-btn"
          >
            <MessageCircle className="w-5 h-5" />
            Contact Support
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-center gap-8 text-sm text-[#626C71]">
            <a href="#" className="hover:text-[#134252]">Terms of Service</a>
            <a href="#" className="hover:text-[#134252]">Privacy Policy</a>
            <a href="#" className="hover:text-[#134252]">Status</a>
          </div>
          <p className="mt-4 text-sm text-[#626C71]">© 2024 BharatPrint. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;