import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { documentsAPI } from '../lib/api';
import { toast } from 'sonner';
import { Download, Clock, AlertTriangle, FileText, Printer, Eye, Shield, Lock } from 'lucide-react';
import Logo from '../components/Logo';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const PublicView = () => {
  const { shareLink } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [printing, setPrinting] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await documentsAPI.getPublic(shareLink);
        setDocument(response.data.document);
        // Set countdown timer
        if (response.data.document.expires) {
          setCountdown(response.data.document.expires);
        }
      } catch (err) {
        if (err.response?.status === 410) {
          setError('expired');
        } else if (err.response?.status === 404) {
          setError('not_found');
        } else {
          setError(err.response?.data?.detail || 'Document not found or expired');
        }
      }
      setLoading(false);
    };

    fetchDocument();
  }, [shareLink]);

  // Countdown timer
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = async () => {
    if (!document) return;
    
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
      
      if (document.oneTimeView) {
        toast.info('This document will now be deleted as it was a one-time view.');
        setTimeout(() => setError('expired'), 3000);
      }
    } catch (err) {
      toast.error('Download failed. Document may have expired.');
    }
  };

  const handlePrint = async () => {
    setPrinting(true);
    try {
      const response = await axios.get(`${API_URL}/documents/download/${shareLink}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: document.fileType });
      const url = window.URL.createObjectURL(blob);
      
      // For images, create an image element and print
      if (document.fileType?.startsWith('image/')) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head><title>Print - ${document.fileName}</title></head>
              <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;">
                <img src="${url}" style="max-width:100%;max-height:100vh;" onload="window.print();"/>
              </body>
            </html>
          `);
          printWindow.document.close();
          toast.success('Print dialog opening...');
        }
      } else if (document.fileType === 'application/pdf') {
        // For PDFs, open in new window and print
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            setTimeout(() => printWindow.print(), 500);
          };
          toast.success('PDF opening for print...');
        }
      } else {
        // For other files, try to open print dialog
        const iframe = window.document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        window.document.body.appendChild(iframe);
        
        iframe.onload = () => {
          try {
            iframe.contentWindow.print();
          } catch (e) {
            // Fallback: open in new tab
            window.open(url, '_blank');
          }
          setTimeout(() => {
            window.document.body.removeChild(iframe);
            window.URL.revokeObjectURL(url);
          }, 1000);
        };
        toast.success('Sending to printer...');
      }
    } catch (err) {
      toast.error('Failed to print. Please try downloading instead.');
    }
    setPrinting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#34BEE8] to-[#00D4FF]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p className="text-white/90">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#34BEE8] to-[#00D4FF] p-4" data-testid="error-view">
        <div className="bg-white rounded-2xl p-12 max-w-md text-center shadow-2xl">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-[#134252] mb-4">
            {error === 'expired' ? 'Document Expired' : 
             error === 'not_found' ? 'Document Not Found' : 
             'Document Unavailable'}
          </h1>
          <p className="text-[#626C71] mb-8">
            {error === 'expired' 
              ? 'This document has been automatically deleted for security. Ask the sender to share a new link.'
              : error === 'not_found'
              ? 'This document doesn\'t exist or the link is incorrect.'
              : typeof error === 'string' ? error : 'Please try again later.'}
          </p>
          <a 
            href="/" 
            className="inline-block bg-[#34BEE8] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2BAED8] transition-colors"
          >
            Go to BharatPrint
          </a>
        </div>
      </div>
    );
  }

  // Check if merchant allowed download
  const allowDownload = document?.allowDownload !== false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#34BEE8] to-[#00D4FF] py-8 px-4" data-testid="public-view-page">
      <div className="max-w-4xl mx-auto">
        {/* Header with Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Logo size="md" />
        </div>

        {/* Main Document Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Document Header */}
          <div className="bg-[#134252] p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-1" data-testid="document-name">
                    {document?.fileName || 'Document'}
                  </h1>
                  <p className="text-white/70 text-sm">{document?.fileType}</p>
                </div>
              </div>
              
              {/* Countdown Timer */}
              {countdown !== null && countdown > 0 && (
                <div className="text-right">
                  <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-mono font-bold">{formatTime(countdown)}</span>
                    </div>
                    <p className="text-xs text-white/70">until auto-delete</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Document Body */}
          <div className="p-6">
            {/* Security Badge */}
            <div className="flex items-center gap-2 text-sm text-green-600 mb-6">
              <Shield className="w-4 h-4" />
              <span>End-to-End Encrypted • Auto-Delete Enabled</span>
            </div>

            {/* One-Time View Warning */}
            {document?.oneTimeView && (
              <div className="bg-[#FEF3C7] border-2 border-[#F59E0B] rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-[#92400E] mb-1">One-Time View Document</h3>
                  <p className="text-sm text-[#92400E]">
                    This document can only be accessed once. After you print or download, it will be permanently deleted.
                  </p>
                </div>
              </div>
            )}

            {/* Order Details */}
            {(document?.customerName || document?.orderDetails) && (
              <div className="bg-[#F8FCFD] rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-[#134252] mb-3">Order Details</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  {document.customerName && (
                    <div>
                      <p className="text-[#626C71] mb-1">Customer</p>
                      <p className="font-medium text-[#134252]">{document.customerName}</p>
                    </div>
                  )}
                  {document.orderDetails && (
                    <div>
                      <p className="text-[#626C71] mb-1">Instructions</p>
                      <p className="font-medium text-[#134252]">{document.orderDetails}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* PRIMARY: Send to Printer - Always Available */}
              <button
                onClick={handlePrint}
                disabled={printing}
                className="w-full bg-gradient-to-r from-[#34BEE8] to-[#00D4FF] text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg"
                data-testid="print-btn"
              >
                <Printer className="w-6 h-6" />
                {printing ? 'Preparing Print...' : 'Send to Printer'}
              </button>

              {/* SECONDARY: Download - Based on Permission */}
              {allowDownload ? (
                <button
                  onClick={handleDownload}
                  className="w-full bg-white border-2 border-[#34BEE8] text-[#34BEE8] py-4 rounded-xl font-semibold text-lg hover:bg-[#F8FCFD] transition-colors flex items-center justify-center gap-3"
                  data-testid="download-btn"
                >
                  <Download className="w-5 h-5" />
                  Download File
                </button>
              ) : (
                <div className="w-full bg-gray-100 border-2 border-gray-300 text-gray-500 py-4 rounded-xl font-semibold flex items-center justify-center gap-3">
                  <Lock className="w-5 h-5" />
                  <span>Download Disabled by Sender</span>
                </div>
              )}
              
              {!allowDownload && (
                <p className="text-center text-sm text-[#626C71]">
                  <Eye className="w-4 h-4 inline mr-1" />
                  View-only mode: You can print but not download this document
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Document Preview (for images) */}
        {document?.fileType?.startsWith('image/') && (
          <div className="bg-white rounded-2xl shadow-xl mt-6 p-6">
            <h3 className="text-lg font-bold text-[#134252] mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Preview
            </h3>
            <div 
              className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center p-4"
              onContextMenu={(e) => !allowDownload && e.preventDefault()}
            >
              <img 
                src={`${API_URL}/documents/download/${shareLink}`} 
                alt="Document Preview"
                className="max-w-full max-h-[500px] object-contain rounded"
                style={{ pointerEvents: allowDownload ? 'auto' : 'none' }}
                draggable={allowDownload}
              />
            </div>
            {!allowDownload && (
              <p className="text-center text-xs text-[#626C71] mt-3">
                Right-click and drag disabled by sender
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-white/90 mt-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-5 h-5" />
            <span className="font-semibold">Powered by BharatPrint</span>
          </div>
          <p className="text-sm text-white/70">Secure document sharing with auto-delete for print shops</p>
        </div>
      </div>
    </div>
  );
};

export default PublicView;
