import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Download, Printer, Clock, AlertTriangle, Eye, ArrowLeft, Shield } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import Logo from '../components/Logo';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const DocumentViewer = () => {
  const { shareLink } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await axios.get(`${API_URL}/documents/public/${shareLink}`);
        setDocument(response.data.document);
      } catch (err) {
        if (err.response?.status === 410) {
          setError('expired');
        } else if (err.response?.status === 404) {
          setError('not_found');
        } else {
          setError('unknown');
        }
      }
      setLoading(false);
    };

    fetchDocument();
  }, [shareLink]);

  const handleDownload = async () => {
    if (!document?.downloadUrl) return;
    
    try {
      const response = await axios.get(`${API_URL}/documents/download/${shareLink}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = window.document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.fileName || 'document');
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Download started!');
    } catch (err) {
      toast.error('Download failed. Document may have expired.');
    }
  };

  const handlePrint = async () => {
    setPrinting(true);
    try {
      // Fetch the document for printing
      const response = await axios.get(`${API_URL}/documents/download/${shareLink}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: document.fileType });
      const url = window.URL.createObjectURL(blob);
      
      // Open in new window for printing
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
        toast.success('Print dialog opened!');
      } else {
        // Fallback: create an iframe for printing
        const iframe = window.document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        window.document.body.appendChild(iframe);
        
        iframe.onload = () => {
          iframe.contentWindow.print();
          setTimeout(() => {
            window.document.body.removeChild(iframe);
            window.URL.revokeObjectURL(url);
          }, 1000);
        };
        toast.success('Sending to printer...');
      }
    } catch (err) {
      toast.error('Failed to print. Please try again.');
    }
    setPrinting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#34BEE8] mx-auto mb-4" />
          <p className="text-[#626C71]">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#134252] mb-4">
            {error === 'expired' ? 'Document Expired' : 
             error === 'not_found' ? 'Document Not Found' : 
             'Something Went Wrong'}
          </h2>
          <p className="text-[#626C71] mb-6">
            {error === 'expired' 
              ? 'This document has been automatically deleted for security. The sender will need to share a new link.'
              : error === 'not_found'
              ? 'This document doesn\'t exist or the link is incorrect.'
              : 'We couldn\'t load this document. Please try again later.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-[#34BEE8] font-semibold hover:underline"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Check if download is allowed based on document settings
  const allowDownload = document?.allowDownload !== false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <span className="text-[#626C71]">Secure Document Viewer</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#626C71]">
            <Shield className="w-4 h-4 text-green-500" />
            <span>End-to-End Encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        {/* Document Info Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#34BEE8] to-[#00D4FF] p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{document.fileName}</h1>
                <p className="text-white/80">Shared document for printing</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Document Details */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-[#F8FCFD] rounded-lg p-4">
                <p className="text-sm text-[#626C71] mb-1">Customer</p>
                <p className="font-semibold text-[#134252]">{document.customerName || 'Anonymous'}</p>
              </div>
              <div className="bg-[#F8FCFD] rounded-lg p-4">
                <p className="text-sm text-[#626C71] mb-1">Order Details</p>
                <p className="font-semibold text-[#134252]">{document.orderDetails || 'Standard Print'}</p>
              </div>
            </div>

            {/* Auto-delete Warning */}
            <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#92400E]" />
                <div>
                  <p className="font-semibold text-[#92400E]">Auto-Delete Enabled</p>
                  <p className="text-sm text-[#92400E]/80">
                    This document will be permanently deleted in {Math.ceil(document.expires / 60)} minutes for security.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Primary Action: Print */}
              <button
                onClick={handlePrint}
                disabled={printing}
                className="w-full bg-gradient-to-r from-[#34BEE8] to-[#00D4FF] text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg"
              >
                <Printer className="w-6 h-6" />
                {printing ? 'Preparing Print...' : 'Send to Printer'}
              </button>

              {/* Secondary: Download (if allowed) */}
              {allowDownload ? (
                <button
                  onClick={handleDownload}
                  className="w-full bg-white border-2 border-[#34BEE8] text-[#34BEE8] py-4 rounded-xl font-semibold text-lg hover:bg-[#F8FCFD] transition-colors flex items-center justify-center gap-3"
                >
                  <Download className="w-5 h-5" />
                  Download File
                </button>
              ) : (
                <div className="w-full bg-gray-100 border-2 border-gray-300 text-gray-500 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3">
                  <Eye className="w-5 h-5" />
                  View Only - Download Disabled by Sender
                </div>
              )}
            </div>

            {/* One-Time View Warning */}
            {document.oneTimeView && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mx-auto mb-2" />
                <p className="font-semibold text-red-700">One-Time View Document</p>
                <p className="text-sm text-red-600">This page will become unavailable after you close it.</p>
              </div>
            )}
          </div>
        </div>

        {/* Preview Section (for images and PDFs) */}
        {(document.fileType?.startsWith('image/') || document.fileType === 'application/pdf') && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-[#134252] mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Document Preview
            </h3>
            <div className="bg-gray-100 rounded-lg overflow-hidden min-h-[400px] flex items-center justify-center">
              {document.fileType?.startsWith('image/') ? (
                <img 
                  src={`${API_URL}/documents/download/${shareLink}`} 
                  alt="Document Preview"
                  className="max-w-full max-h-[600px] object-contain"
                  onContextMenu={(e) => !allowDownload && e.preventDefault()}
                />
              ) : (
                <iframe
                  src={`${API_URL}/documents/download/${shareLink}#toolbar=0`}
                  className="w-full h-[600px]"
                  title="Document Preview"
                />
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-[#626C71] text-sm">
          <p>Powered by <span className="font-semibold text-[#34BEE8]">BharatPrint</span></p>
          <p className="mt-2">Documents are encrypted and auto-deleted for your security</p>
        </div>
      </main>
    </div>
  );
};

export default DocumentViewer;
