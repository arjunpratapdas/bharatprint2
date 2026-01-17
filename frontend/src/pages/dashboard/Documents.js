import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { documentsAPI } from '../../lib/api';
import { toast } from 'sonner';
import { FileText, ExternalLink, Copy, Trash2, Eye, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await documentsAPI.list({ limit: 20, offset: 0 });
      setDocuments(response.data.documents);
      setTotal(response.data.total);
    } catch (error) {
      toast.error('Failed to load documents');
    }
    setLoading(false);
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await documentsAPI.delete(id);
      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="spinner" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="documents-page">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#134252] mb-2">Documents</h2>
            <p className="text-[#626C71]">Manage your uploaded documents and share links</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[#626C71]">Total Documents</p>
            <p className="text-3xl font-bold text-[#134252]">{total}</p>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <FileText className="w-16 h-16 text-[#626C71] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#134252] mb-2">No Documents Yet</h3>
            <p className="text-[#626C71] mb-6">Upload your first document to get started</p>
            <button
              onClick={() => window.location.href = '/dashboard/upload'}
              className="bg-[#34BEE8] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2BAED8] transition-colors"
              data-testid="upload-first-btn"
            >
              Upload Document
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8FCFD] border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#134252]">Document</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#134252]">Customer</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#134252]">Size</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#134252]">Views</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#134252]">Expires</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#134252]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-b border-gray-200 hover:bg-[#F8FCFD] transition-colors" data-testid={`document-row-${doc.id}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#F8FCFD] rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-[#34BEE8]" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#134252]">{doc.documentName}</p>
                            <p className="text-sm text-[#626C71]">{format(new Date(doc.createdAt), 'MMM dd, yyyy')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[#134252]">{doc.customerName || 'N/A'}</p>
                        <p className="text-sm text-[#626C71]">{doc.customerPhone || ''}</p>
                      </td>
                      <td className="px-6 py-4 text-[#626C71]">
                        {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-[#626C71]" />
                          <span className="font-semibold text-[#134252]">{doc.shareCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#626C71]">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {format(new Date(doc.expiresAt), 'MMM dd, hh:mm a')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyLink(doc.sharedLink)}
                            className="p-2 text-[#34BEE8] hover:bg-[#F8FCFD] rounded-lg transition-colors"
                            title="Copy link"
                            data-testid={`copy-link-${doc.id}`}
                          >
                            <Copy className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => window.open(doc.sharedLink, '_blank')}
                            className="p-2 text-[#34BEE8] hover:bg-[#F8FCFD] rounded-lg transition-colors"
                            title="Open link"
                            data-testid={`view-link-${doc.id}`}
                          >
                            <ExternalLink className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                            data-testid={`delete-${doc.id}`}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Documents;