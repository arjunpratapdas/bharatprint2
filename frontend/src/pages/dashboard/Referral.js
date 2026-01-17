import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { referralsAPI } from '../../lib/api';
import { toast } from 'sonner';
import { Copy, Share2, Gift, Users, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';

const Referral = () => {
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const response = await referralsAPI.getMyCode();
      setReferralData(response.data.referral);
    } catch (error) {
      toast.error('Failed to load referral data');
    }
    setLoading(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralData.code);
    toast.success('Referral code copied!');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralData.referralLink);
    toast.success('Referral link copied!');
  };

  const handleShareWhatsApp = () => {
    const message = `Join BharatPrint - The all-in-one platform for print shops! Get 3-day free trial. Use my referral code: ${referralData.code}\n\n${referralData.referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'earned':
      case 'claimed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      earned: 'bg-green-100 text-green-700',
      claimed: 'bg-blue-100 text-blue-700',
      pending: 'bg-yellow-100 text-yellow-700'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status.toUpperCase()}
      </span>
    );
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
      <div className="space-y-6" data-testid="referral-page">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-8 text-white">
          <h2 className="text-4xl font-bold mb-2">Referral Program</h2>
          <p className="text-lg text-white/90">Invite fellow print shops and earn rewards. Track your earnings and successful referrals here.</p>
        </div>

        {/* Performance Summary */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <DollarSign className="w-10 h-10 text-green-500 mb-4" />
            <p className="text-sm text-[#626C71] mb-1">TOTAL EARNED</p>
            <p className="text-3xl font-bold text-[#134252]">₹{referralData.rewardsEarned.totalRupees}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <Gift className="w-10 h-10 text-purple-500 mb-4" />
            <p className="text-sm text-[#626C71] mb-1">PENDING</p>
            <p className="text-3xl font-bold text-[#134252]">{referralData.referralsCount.pending}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <Users className="w-10 h-10 text-blue-500 mb-4" />
            <p className="text-sm text-[#626C71] mb-1">SUCCESSFUL</p>
            <p className="text-3xl font-bold text-[#134252]">{referralData.referralsCount.earned + referralData.referralsCount.claimed}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <CheckCircle className="w-10 h-10 text-green-500 mb-4" />
            <p className="text-sm text-[#626C71] mb-1">CLAIMED</p>
            <p className="text-3xl font-bold text-green-500">₹{referralData.rewardsEarned.claimedRupees}</p>
          </div>
        </div>

        {/* Promotion Card */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-8 text-white">
          <span className="inline-block bg-white/20 backdrop-blur text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
            LIMITED TIME OFFER
          </span>
          <h3 className="text-3xl font-bold mb-4">Earn ₹500 per referral</h3>
          <p className="text-white/90 text-lg">
            Grow the BharatPrint network. Get ₹500 directly in your wallet for every print shop that completes their first order.
          </p>
        </div>

        {/* Share Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Referral Code & Link */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-[#134252] mb-6">Your Referral Code</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#626C71] mb-2">Referral Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralData.code}
                  readOnly
                  className="flex-1 px-4 py-3 bg-[#F8FCFD] border border-gray-300 rounded-lg font-mono font-bold text-lg"
                  data-testid="referral-code-input"
                />
                <button
                  onClick={handleCopyCode}
                  className="bg-[#34BEE8] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2BAED8] transition-colors"
                  data-testid="copy-code-btn"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#626C71] mb-2">Referral Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralData.referralLink}
                  readOnly
                  className="flex-1 px-4 py-3 bg-[#F8FCFD] border border-gray-300 rounded-lg text-sm"
                  data-testid="referral-link-input"
                />
                <button
                  onClick={handleCopyLink}
                  className="bg-[#34BEE8] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2BAED8] transition-colors"
                  data-testid="copy-link-btn"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>

            <button
              onClick={handleShareWhatsApp}
              className="w-full bg-[#25D366] text-white py-3 rounded-lg font-semibold hover:bg-[#20BA5A] transition-colors flex items-center justify-center gap-2"
              data-testid="share-whatsapp-btn"
            >
              <Share2 className="w-5 h-5" />
              Share on WhatsApp
            </button>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-[#134252] mb-6">QR Code</h3>
            <div className="bg-white border-2 border-gray-200 rounded-lg p-8 text-center">
              <QRCodeSVG value={referralData.referralLink} size={200} />
              <p className="text-sm text-[#626C71] mt-4">Scan to sign up with your code</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-[#134252] mb-6">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#34BEE8] to-[#00D4FF] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="font-semibold text-[#134252] mb-2">Share Link</h4>
              <p className="text-[#626C71] text-sm">Share your unique referral link or code with other print shops</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#34BEE8] to-[#00D4FF] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="font-semibold text-[#134252] mb-2">Shop Joins</h4>
              <p className="text-[#626C71] text-sm">They sign up using your link and complete their first order</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#34BEE8] to-[#00D4FF] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="font-semibold text-[#134252] mb-2">You Earn</h4>
              <p className="text-[#626C71] text-sm">Get ₹500 credited to your account immediately</p>
            </div>
          </div>
        </div>

        {/* Referral History */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#134252]">Referral History</h3>
            <span className="text-sm text-[#626C71]">Showing {referralData.referrals.length} referrals</span>
          </div>

          {referralData.referrals.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-[#626C71] mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-[#134252] mb-2">No Referrals Yet</h4>
              <p className="text-[#626C71]">Start sharing your referral link to earn rewards!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8FCFD] border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#134252]">Shop Name</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#134252]">Date</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#134252]">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#134252]">Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {referralData.referrals.map((ref) => (
                    <tr key={ref.id} className="border-b border-gray-200 hover:bg-[#F8FCFD] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(ref.status)}
                          <span className="font-semibold text-[#134252]">{ref.shopName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#626C71]">
                        {format(new Date(ref.referredAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(ref.status)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-green-500">₹{ref.rewardAmount}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Referral;