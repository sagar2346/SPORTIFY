import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';
import toast from 'react-hot-toast';
import KycVerification from '../components/customer/KycVerification';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="card space-y-8">
        {/* Personal Details */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">Full Name</label>
              <p className="mt-1 text-lg text-gray-900 font-medium">{profileData?.name || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Email Address</label>
              <p className="mt-1 text-lg text-gray-900 font-medium">{profileData?.email || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Phone Number</label>
              <p className="mt-1 text-lg text-gray-900 font-medium">{profileData?.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Account Type</label>
              <span className="mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                {profileData?.role?.replace('_', ' ') || 'Customer'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Loyalty Points</label>
              <p className="mt-1 text-lg text-emerald-600 font-bold">{profileData?.loyaltyPoints || 0} pts</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">My Referral Code</label>
              <p className="mt-1 text-lg text-gray-900 font-mono font-bold tracking-wider">{profileData?.referralCode || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Address Details */}
        <div>
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-xl font-semibold text-gray-800">Address Details</h2>
            <button
              onClick={() => setShowAddressModal(true)}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Edit Address
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">Street</label>
              <p className="mt-1 text-base text-gray-900">{profileData?.address?.street || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">City</label>
              <p className="mt-1 text-base text-gray-900">{profileData?.address?.city || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">State</label>
              <p className="mt-1 text-base text-gray-900">{profileData?.address?.state || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">ZIP Code</label>
              <p className="mt-1 text-base text-gray-900">{profileData?.address?.zipCode || '-'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500">Country</label>
              <p className="mt-1 text-base text-gray-900">{profileData?.address?.country || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {profileData?.role === 'customer' && (
        <div className="mt-8">
          <KycVerification />
        </div>
      )}

      {/* Address Edit Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Edit Address</h3>
            <form onSubmit={handleAddressUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Street</label>
                <input
                  type="text"
                  required
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={addressForm.zipCode}
                    onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <input
                    type="text"
                    required
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

  );
};

export default Profile;
