import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { documentsAPI } from '../../lib/api';
import { toast } from 'sonner';
import { Upload, FileText, X, Check, Calendar, Clock, Eye, EyeOff, Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const UploadDocument = () => {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    orderDetails: '',
    dueDate: '',
    oneTimeView: false,
    deleteAfterMinutes: 5,
    allowDownload: true
  });
  const [loading, setLoading] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    if (selectedFile.size > 52428800) {
      toast.error('File too large. Maximum size is 50MB.');
      return;
    }
    if (!['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'].includes(selectedFile.type)) {
      toast.error('Invalid file type. Only PDF, PNG, and JPG are supported.');
      return;
    }
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !formData.customerName) {
      toast.error('Please select a file and enter customer name');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('customerName', formData.customerName);
      data.append('customerPhone', formData.customerPhone);
      data.append('customerEmail', formData.customerEmail);
      data.append('orderDetails', formData.orderDetails);
      data.append('dueDate', formData.dueDate);
      data.append('oneTimeView', formData.oneTimeView);
      data.append('deleteAfterMinutes', formData.deleteAfterMinutes);
      data.append('allowDownload', formData.allowDownload);

      const response = await documentsAPI.upload(data);
      setUploadedDoc(response.data.document);
      toast.success('Document uploaded successfully!');
      
      // Reset form
      setFile(null);
      setFormData({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        orderDetails: '',
        dueDate: '',
        oneTimeView: false,
        deleteAfterMinutes: 5,
        allowDownload: true
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload document');
    }
    setLoading(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(uploadedDoc.sharedLink);
    toast.success('Link copied to clipboard!');
  };

  if (uploadedDoc) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto" data-testid="upload-success">
          <div className="bg-white rounded-xl border-2 border-green-500 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-[#134252] mb-2">Document Uploaded Successfully!</h2>
              <p className="text-[#626C71]">Share this link with your customer</p>
            </div>

            <div className="bg-[#F8FCFD] rounded-lg p-6 mb-6">
              <label className="block text-sm font-medium text-[#134252] mb-2">Share Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={uploadedDoc.sharedLink}
                  readOnly
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white"
                  data-testid="share-link-input"
                />
                <button
                  onClick={handleCopyLink}
                  className="bg-[#34BEE8] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2BAED8] transition-colors flex items-center gap-2"
                  data-testid="copy-link-btn"
                >
                  <Copy className="w-5 h-5" />
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6 text-center">
              <p className="text-sm font-medium text-[#134252] mb-4">Scan QR Code to View</p>
              <div className="inline-block p-4 bg-white">
                <QRCodeSVG value={uploadedDoc.sharedLink} size={200} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="bg-[#F8FCFD] p-4 rounded-lg">
                <p className="text-[#626C71] mb-1">Expires In</p>
                <p className="font-semibold text-[#134252]">{Math.floor(uploadedDoc.expiresIn / 60)} minutes</p>
              </div>
              <div className="bg-[#F8FCFD] p-4 rounded-lg">
                <p className="text-[#626C71] mb-1">Views</p>
                <p className="font-semibold text-[#134252]">{uploadedDoc.shareCount}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setUploadedDoc(null)}
                className="flex-1 bg-[#34BEE8] text-white py-3 rounded-lg font-semibold hover:bg-[#2BAED8] transition-colors"
                data-testid="upload-another-btn"
              >
                Upload Another
              </button>
              <button
                onClick={() => window.location.href = `/dashboard/documents`}
                className="flex-1 bg-white text-[#134252] py-3 rounded-lg font-semibold border-2 border-gray-200 hover:bg-gray-50 transition-colors"
                data-testid="view-all-btn"
              >
                View All Documents
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto" data-testid="upload-document-page">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#134252] mb-2">Upload Document</h2>
          <p className="text-[#626C71]">Securely share documents with auto-delete protection</p>
        </div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
          {/* Left Column - File Upload */}
          <div>
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                dragActive ? 'border-[#34BEE8] bg-[#F8FCFD]' : 'border-gray-300 hover:border-[#34BEE8]'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              data-testid="file-upload-zone"
            >
              {!file ? (
                <>
                  <Upload className="w-16 h-16 text-[#626C71] mx-auto mb-4" />
                  <p className="text-[#134252] font-semibold mb-2">Drag & drop your file here</p>
                  <p className="text-[#626C71] text-sm mb-4">or</p>
                  <label className="inline-block bg-[#34BEE8] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2BAED8] transition-colors cursor-pointer">
                    Browse Files
                    <input
                      type="file"
                      onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      data-testid="file-input"
                    />
                  </label>
                  <p className="text-xs text-[#626C71] mt-4">PDF, PNG, JPG (Max 50MB)</p>
                </>
              ) : (
                <div className="relative">
                  <FileText className="w-16 h-16 text-[#34BEE8] mx-auto mb-4" />
                  <p className="font-semibold text-[#134252] mb-1">{file.name}</p>
                  <p className="text-sm text-[#626C71] mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="absolute top-0 right-0 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    data-testid="remove-file-btn"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Customer Details */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#134252] mb-2">Customer Name *</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent"
                placeholder="Enter customer name"
                required
                data-testid="customer-name-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#134252] mb-2">Phone Number (Optional)</label>
              <div className="flex">
                <span className="inline-flex items-center px-4 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-[#626C71]">+91</span>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({...formData, customerPhone: e.target.value.slice(0, 10)})}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent"
                  placeholder="9876543210"
                  data-testid="customer-phone-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#134252] mb-2">Email (Optional)</label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent"
                placeholder="customer@email.com"
                data-testid="customer-email-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#134252] mb-2">Order Details</label>
              <textarea
                value={formData.orderDetails}
                onChange={(e) => setFormData({...formData, orderDetails: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent h-24 resize-none"
                placeholder="Business cards, 500 qty, matte finish"
                data-testid="order-details-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#134252] mb-2">Due Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#626C71]" />
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent"
                  data-testid="due-date-input"
                />
              </div>
            </div>

            <div className="bg-[#F8FCFD] rounded-lg p-4 space-y-4">
              <h4 className="font-semibold text-[#134252]">Security Settings</h4>
              
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm text-[#134252] font-medium">Allow Download</span>
                  <p className="text-xs text-[#626C71]">Customer can download the file locally</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.allowDownload}
                  onChange={(e) => setFormData({...formData, allowDownload: e.target.checked})}
                  className="w-5 h-5 text-[#34BEE8] rounded focus:ring-2 focus:ring-[#34BEE8]"
                  data-testid="allow-download-checkbox"
                />
              </label>
              
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm text-[#134252] font-medium">One-time View</span>
                  <p className="text-xs text-[#626C71]">Delete after first view</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.oneTimeView}
                  onChange={(e) => setFormData({...formData, oneTimeView: e.target.checked})}
                  className="w-5 h-5 text-[#34BEE8] rounded focus:ring-2 focus:ring-[#34BEE8]"
                  data-testid="one-time-view-checkbox"
                />
              </label>

              <div>
                <label className="block text-sm font-medium text-[#134252] mb-2">Auto-delete after</label>
                <select
                  value={formData.deleteAfterMinutes}
                  onChange={(e) => setFormData({...formData, deleteAfterMinutes: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent"
                  data-testid="delete-after-select"
                >
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !file || !formData.customerName}
              className="w-full bg-[#34BEE8] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#2BAED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="upload-submit-btn"
            >
              {loading ? 'Uploading...' : 'Upload & Generate Link'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default UploadDocument;