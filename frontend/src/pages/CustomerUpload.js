import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Upload, FileText, Clock, Download, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import Logo from '../components/Logo';

const CustomerUpload = () => {
  const { merchantCode } = useParams();
  const [file, setFile] = useState(null);
  const [selfDestructTime, setSelfDestructTime] = useState(5);
  const [allowDownload, setAllowDownload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [merchantName, setMerchantName] = useState('');

  const handleFileSelect = (selectedFile) => {
    if (selectedFile.size > 52428800) {
      toast.error('File too large. Maximum size is 50MB.');
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('self_destruct_minutes', selfDestructTime);
      formData.append('allow_merchant_download', allowDownload);

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/documents/customer-upload/${merchantCode}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      setMerchantName(response.data.merchantShop);
      setUploaded(true);
      toast.success('Document uploaded successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload document');
    }
    setLoading(false);
  };

  if (uploaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#34BEE8] to-[#00D4FF] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-[#134252] dark:text-white mb-4">Upload Successful!</h2>
          <p className="text-[#626C71] dark:text-gray-300 mb-2">
            Your document has been sent to
          </p>
          <p className="text-xl font-bold text-[#34BEE8] mb-6">{merchantName}</p>
          <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded-lg p-4 mb-6">
            <p className="text-sm text-[#92400E] flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              Document will auto-delete in {selfDestructTime} minutes
            </p>
          </div>
          <p className="text-sm text-[#626C71] dark:text-gray-400">
            Your document is secure and will be automatically deleted after the specified time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors p-4">
      <div className="max-w-4xl mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-4xl font-bold text-[#134252] dark:text-white mb-4">
            Upload Your Document
          </h1>
          <p className="text-lg text-[#626C71] dark:text-gray-300">
            Securely share your files for printing
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          {/* File Upload */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-[#134252] dark:text-white mb-4">
              Select Document
            </label>
            {!file ? (
              <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:border-[#34BEE8] transition-all block">
                <Upload className="w-16 h-16 text-[#626C71] dark:text-gray-400 mx-auto mb-4" />
                <p className="text-[#134252] dark:text-white font-semibold mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-[#626C71] dark:text-gray-400">
                  PDF, PNG, JPG (Max 50MB)
                </p>
                <input
                  type="file"
                  onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                />
              </label>
            ) : (
              <div className="bg-[#F8FCFD] dark:bg-gray-700 rounded-lg p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileText className="w-10 h-10 text-[#34BEE8]" />
                  <div>
                    <p className="font-semibold text-[#134252] dark:text-white">{file.name}</p>
                    <p className="text-sm text-[#626C71] dark:text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-red-500 hover:text-red-600 font-semibold"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Self-Destruct Time */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-[#134252] dark:text-white mb-4">
              <Clock className="inline w-4 h-4 mr-2" />
              Auto-Delete After
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[5, 10, 15].map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => setSelfDestructTime(minutes)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selfDestructTime === minutes
                      ? 'border-[#34BEE8] bg-[#F8FCFD] dark:bg-gray-700'
                      : 'border-gray-300 dark:border-gray-600 hover:border-[#34BEE8]'
                  }`}
                >
                  <p className="text-2xl font-bold text-[#134252] dark:text-white">{minutes}</p>
                  <p className="text-sm text-[#626C71] dark:text-gray-400">minutes</p>
                </button>
              ))}
            </div>
          </div>

          {/* Download Permission */}
          <div className="mb-8 bg-[#F8FCFD] dark:bg-gray-700 rounded-lg p-6">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-[#34BEE8]" />
                <div>
                  <p className="font-semibold text-[#134252] dark:text-white">
                    Allow merchant to download
                  </p>
                  <p className="text-sm text-[#626C71] dark:text-gray-400">
                    Merchant can save file locally. Otherwise, view-only mode.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={allowDownload}
                onChange={(e) => setAllowDownload(e.target.checked)}
                className="w-6 h-6 text-[#34BEE8] rounded focus:ring-2 focus:ring-[#34BEE8]"
              />
            </label>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="w-full bg-[#34BEE8] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#2BAED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'Uploading...' : 'Upload Document'}
            <Upload className="w-5 h-5" />
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-[#626C71] dark:text-gray-400 text-sm">
          <p>Powered by <span className="font-semibold text-[#34BEE8]">BharatPrint</span></p>
          <p className="mt-2">Your documents are encrypted and auto-deleted for security</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerUpload;
