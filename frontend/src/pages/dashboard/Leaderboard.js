import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { leaderboardAPI } from '../../lib/api';
import { toast } from 'sonner';
import { Trophy, Medal, Award, TrendingUp, MapPin, Users, DollarSign, FileText } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Leaderboard = () => {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [yourRank, setYourRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('');

  const cities = ['All Cities', 'Guwahati', 'Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Chennai'];

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedCity]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const params = selectedCity && selectedCity !== 'All Cities' ? { city: selectedCity, limit: 100 } : { limit: 100 };
      const response = await leaderboardAPI.get(params);
      setLeaderboard(response.data.leaderboard);
      setYourRank(response.data.yourRank);
    } catch (error) {
      toast.error('Failed to load leaderboard');
    }
    setLoading(false);
  };

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-orange-600" />;
      default: return <span className="text-[#626C71] font-semibold">#{rank}</span>;
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
      <div className="space-y-6" data-testid="leaderboard-page">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#34BEE8] to-[#00D4FF] rounded-xl p-8 text-white">
          <h2 className="text-4xl font-bold mb-2">Leaderboard</h2>
          <p className="text-lg text-white/90 mb-6">Compete, Refer, Earn. See who's leading the print revolution.</p>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-5 h-5" />
            <span>Competition ends in 4 days</span>
          </div>
        </div>

        {/* Your Rank Card */}
        {yourRank && (
          <div className="bg-white rounded-xl border-2 border-[#34BEE8] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#626C71] mb-1">Your Rank</p>
                <h3 className="text-4xl font-bold text-[#134252]">#{yourRank.global}</h3>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-[#626C71]">Referrals</p>
                  <p className="text-2xl font-bold text-[#134252]">{user?.referralsSuccessful || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-[#626C71]">Rewards</p>
                  <p className="text-2xl font-bold text-green-500">₹{user?.totalRewardsEarned || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-[#626C71]">Documents</p>
                  <p className="text-2xl font-bold text-[#134252]">{user?.documentsUploaded || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-4">
          <MapPin className="w-5 h-5 text-[#626C71]" />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent"
            data-testid="city-filter"
          >
            {cities.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
          <div className="flex-1" />
          <button
            onClick={() => window.location.href = '/dashboard/referral'}
            className="bg-[#34BEE8] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#2BAED8] transition-colors"
            data-testid="invite-friends-btn"
          >
            Invite Friends
          </button>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8FCFD] border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#134252]">Rank</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#134252]">Shop Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#134252]">City</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#134252]">Referrals</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#134252]">Rewards</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#134252]">Documents</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#134252]">Views</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.rank}
                    className={`border-b border-gray-200 transition-colors ${
                      entry.rank <= 3 ? 'bg-gradient-to-r from-[#FEF3C7] to-white' : 'hover:bg-[#F8FCFD]'
                    }`}
                    data-testid={`leaderboard-rank-${entry.rank}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(entry.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[#134252]">{entry.shopName}</p>
                    </td>
                    <td className="px-6 py-4 text-[#626C71]">
                      {entry.city || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#626C71]" />
                        <span className="font-semibold text-[#134252]">{entry.referralCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="font-semibold text-green-500">₹{entry.totalRewards}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#626C71]" />
                        <span className="text-[#134252]">{entry.documentsUploaded}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#626C71]">
                      {entry.totalViews || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Competition */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Monthly Competition</h3>
          <p className="text-white/90 mb-6">Top 3 referrers win cash prizes every month!</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
              <p className="text-3xl font-bold mb-1">₹5,000</p>
              <p className="text-white/90 text-sm">1st Place</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <Medal className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-3xl font-bold mb-1">₹2,500</p>
              <p className="text-white/90 text-sm">2nd Place</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <p className="text-3xl font-bold mb-1">₹1,000</p>
              <p className="text-white/90 text-sm">3rd Place</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Leaderboard;