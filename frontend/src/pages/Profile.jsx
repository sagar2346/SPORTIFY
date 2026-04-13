import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import KycVerification from '../components/customer/KycVerification';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiAward, FiStar, FiChevronRight, FiEdit3, FiBriefcase, FiRefreshCw, FiShield, FiCheckCircle } from 'react-icons/fi';
import { fadeIn, staggerContainer, listItemVariants } from '../utils/motion';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userService.getProfile();
      const data = response.data.data;
      setProfileData(data);
      if (data.address) {
        setAddressForm({
          street: data.address.street || '',
          city: data.address.city || '',
          state: data.address.state || '',
          zipCode: data.address.zipCode || '',
          country: data.address.country || ''
        });
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await userService.updateProfile({
        address: addressForm
      });
      setProfileData(response.data.data);
      setShowAddressModal(false);
      toast.success('Address updated successfully');
    } catch (error) {
      toast.error('Failed to update address');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRedeemPoints = async (e) => {
    e.preventDefault();
    if (!pointsToRedeem || pointsToRedeem <= 0) {
      toast.error('Please enter a valid amount of points');
      return;
    }
    
    setRedeeming(true);
    try {
      const response = await userService.redeemLoyaltyPoints(parseFloat(pointsToRedeem));
      toast.success(response.data.message);
      setProfileData({
        ...profileData,
        loyaltyPoints: response.data.data.loyaltyPoints,
        walletBalance: response.data.data.walletBalance
      });
      setShowRedeemModal(false);
      setPointsToRedeem('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to redeem points');
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="max-w-4xl mx-auto"
    >
      <motion.div variants={fadeIn('down', 'tween', 0.1, 0.6)} className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">User profile</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage your personal information and preferences.</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest bg-slate-900 text-white shadow-xl shadow-slate-900/10">
            {profileData?.role?.replace('_', ' ') || 'Customer'}
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-8">
        {/* Profile Card */}
        <motion.div variants={listItemVariants} className="bg-white rounded-[2rem] border border-slate-100 p-8 md:p-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-10 pb-8 border-b border-slate-50">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-900/20">
                <FiUser size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{profileData?.name || 'User Name'}</h2>
                <p className="text-slate-500 font-medium">{profileData?.email || 'email@example.com'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <FiPhone size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Phone number</span>
                </div>
                <p className="text-base text-slate-900 font-bold">{profileData?.phone || 'Not provided'}</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <FiAward size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Loyalty points</span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl text-emerald-600 font-bold">{(profileData?.loyaltyPoints || 0).toFixed(2)}</p>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">Level 1</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <FiStar size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Referral code</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl inline-flex group cursor-pointer hover:bg-slate-100 transition-colors">
                  <p className="text-lg text-slate-900 font-mono font-bold tracking-wider">{profileData?.referralCode || 'N/A'}</p>
                  <FiChevronRight className="ml-2 mt-1 text-slate-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Wallet Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <FiBriefcase size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">My Wallet</span>
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-3xl text-slate-900 font-bold">रू {(profileData?.walletBalance || 0).toLocaleString()}</p>
                  <button 
                    onClick={() => setShowRedeemModal(true)}
                    className="flex items-center justify-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-100 transition-all w-fit"
                  >
                    <FiRefreshCw size={12} className={redeeming ? 'animate-spin' : ''} />
                    Convert Points to Cash
                  </button>
                </div>
              </div>

              {/* KYC Status Section (Only for Venue Owners/Partners) */}
              {profileData?.role !== 'customer' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <FiShield size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Identity Status</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <p className={`text-base font-bold ${
                        profileData?.kycStatus === 'verified' ? 'text-emerald-600' :
                        profileData?.kycStatus === 'pending' ? 'text-amber-500' :
                        'text-slate-400'
                      }`}>
                        {profileData?.kycStatus?.replace('_', ' ')?.toUpperCase() || 'NOT VERIFIED'}
                      </p>
                      {profileData?.kycStatus === 'verified' && <FiCheckCircle className="text-emerald-500" />}
                    </div>
                    {profileData?.kycStatus !== 'verified' && (
                      <Link 
                        to="/kyc"
                        className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-900 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 transition-all w-fit"
                      >
                        {profileData?.kycStatus === 'pending' ? 'View Submission' : 'Complete Verification'}
                        <FiChevronRight size={12} />
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Address Card */}
        <motion.div variants={listItemVariants} className="bg-white rounded-[2rem] border border-slate-100 p-8 md:p-12 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 pb-8 border-b border-slate-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <FiMapPin size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Address information</h2>
                <p className="text-xs text-slate-500 font-medium">Your primary residence details.</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddressModal(true)}
              className="group flex items-center gap-2 text-[10px] font-bold text-slate-900 uppercase tracking-widest bg-slate-50 px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
            >
              <FiEdit3 size={14} />
              Update address
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Street address</span>
              <p className="text-base text-slate-900 font-bold">{profileData?.address?.street || '—'}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">City</span>
              <p className="text-base text-slate-900 font-bold">{profileData?.address?.city || '—'}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">State / Province</span>
              <p className="text-base text-slate-900 font-bold">{profileData?.address?.state || '—'}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Postal code</span>
              <p className="text-base text-slate-900 font-bold">{profileData?.address?.zipCode || '—'}</p>
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Country</span>
              <p className="text-base text-slate-900 font-bold">{profileData?.address?.country || '—'}</p>
            </div>
          </div>
        </motion.div>
      </div>


      {/* Address Edit Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddressModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] max-w-md w-full p-10 shadow-2xl border border-slate-100 relative z-20"
            >
              <div className="mb-10 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 mx-auto mb-4">
                  <FiMapPin size={28} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Update address</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Update your residence details</p>
              </div>

              <form onSubmit={handleAddressUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Street address</label>
                  <input
                    type="text"
                    required
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-medium placeholder:text-slate-300"
                    placeholder="e.g. 123 Sports Lane"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">City</label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">State</label>
                    <input
                      type="text"
                      required
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Zip code</label>
                    <input
                      type="text"
                      required
                      value={addressForm.zipCode}
                      onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Country</label>
                    <input
                      type="text"
                      required
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 mt-10">
                  <button
                    type="submit"
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold tracking-widest uppercase text-xs shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition-all disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? 'Updating...' : 'Save changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="w-full py-2 text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-[10px] transition-colors"
                    disabled={submitting}
                  >
                    Cancel update
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Points Redemption Modal */}
      <AnimatePresence>
        {showRedeemModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !redeeming && setShowRedeemModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] max-w-md w-full p-10 shadow-2xl border border-slate-100 relative z-20"
            >
              <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-4">
                  <FiRefreshCw size={28} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Redeem Points</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">1 Loyalty Point = $1 USD (रू 130)</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl mb-8 flex justify-between items-center border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Available Points</p>
                  <p className="text-xl font-bold text-slate-900">{(profileData?.loyaltyPoints || 0).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Value</p>
                  <p className="text-xl font-bold text-emerald-600">रू {((profileData?.loyaltyPoints || 0) * 130).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
              </div>

              <form onSubmit={handleRedeemPoints} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Points to convert</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      max={profileData?.loyaltyPoints}
                      value={pointsToRedeem}
                      onChange={(e) => setPointsToRedeem(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-lg"
                      placeholder="Enter points amount"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      = रू {(parseFloat(pointsToRedeem || 0) * 130).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 mt-10">
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold tracking-widest uppercase text-xs shadow-2xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50"
                    disabled={redeeming || !pointsToRedeem}
                  >
                    {redeeming ? 'Processing...' : 'Confirm Redemption'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRedeemModal(false)}
                    className="w-full py-2 text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-[10px] transition-colors"
                    disabled={redeeming}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;
