// Admin Dashboard Component for SPORTIFY Platform
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService, bookingService, venueService } from '../services/api';
import toast from 'react-hot-toast';
import CustomerMessages from './admin/CustomerMessages';
import KycVerificationRequests from './admin/KycVerificationRequests';
import AdminFootage from './admin/AdminFootage';
import ManageTournaments from './admin/ManageTournaments';
import { FiUsers, FiMapPin, FiCalendar, FiDollarSign, FiMail, FiGrid, FiTrash2, FiCheck, FiVideo, FiAward, FiShield } from 'react-icons/fi';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    loadDashboard();
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    try {
      const response = await adminService.getOwnerRevenues();
      setRevenueData(response.data.data);
    } catch (error) {
      console.error('Error loading revenue data:', error);
    }
  };

  const loadDashboard = async () => {
    try {
      const response = await adminService.getDashboard();
      setDashboard(response.data.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // toast.error('Failed to load dashboard data'); 
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVenue = async (venueId) => {
    try {
      await adminService.approveVenue(venueId);
      toast.success('Venue approved successfully');
      loadDashboard();
    } catch (error) {
      console.error('Error approving venue:', error);
      toast.error('Failed to approve venue');
    }
  };

  const handleDeleteVenue = async (venueId) => {
    if (!window.confirm('Are you sure you want to delete this venue?')) return;
    try {
      await venueService.deleteVenue(venueId);
      toast.success('Venue deleted successfully');
      loadDashboard();
    } catch (error) {
      console.error('Error deleting venue:', error);
      toast.error('Failed to delete venue');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this booking? This action cannot be undone.')) return;
    try {
      await bookingService.deleteBooking(bookingId);
      toast.success('Booking deleted permanently');
      loadDashboard();
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    }
  };

  const handleVerifyPayment = async (bookingId) => {
    const toastId = toast.loading('Verifying payment...');
    try {
      await bookingService.confirmBooking(bookingId);
      toast.success('Payment verified and booking confirmed', { id: toastId });
      loadDashboard();
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error(error.response?.data?.message || 'Failed to verify payment', { id: toastId });
    }
  };

  const handleRejectPayment = async (bookingId) => {
    const toastId = toast.loading('Rejecting payment...');
    try {
      await bookingService.cancelBooking(bookingId, 'Payment rejected by admin');
      toast.success('Payment rejected and booking cancelled', { id: toastId });
      loadDashboard();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error(error.response?.data?.message || 'Failed to reject payment', { id: toastId });
    }
  };

  const handleExportReport = () => {
    console.log('Export Report Clicked');
    if (!revenueData || revenueData.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      const headers = ['Owner Name', 'Email', 'Total Bookings', 'Total Revenue'];
      const csvContent = [
        headers.join(','),
        ...revenueData.map(item =>
          `"${item.name || ''}","${item.email || ''}",${item.totalBookings || 0},${item.totalRevenue || 0}`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `revenue_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export report');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Stats - Staggered Animation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card hover:-translate-y-1 transition-transform duration-300 border-l-4 border-l-indigo-500 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">Total Users</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{dashboard?.stats?.totalUsers || 0}</p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-xl">
              <FiUsers className="text-2xl text-indigo-600" />
            </div>
          </div>
        </div>

        <Link to="/venues" className="card hover:-translate-y-1 transition-transform duration-300 border-l-4 border-l-purple-500 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">Total Venues</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{dashboard?.stats?.totalVenues || 0}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-xl">
              <FiMapPin className="text-2xl text-purple-600" />
            </div>
          </div>
        </Link>

        <div className="card hover:-translate-y-1 transition-transform duration-300 border-l-4 border-l-blue-500 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{dashboard?.stats?.totalBookings || 0}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl">
              <FiCalendar className="text-2xl text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card hover:-translate-y-1 transition-transform duration-300 border-l-4 border-l-emerald-500 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">Rs. {dashboard?.stats?.totalRevenue || 0}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl">
              <FiDollarSign className="text-2xl text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Verification Requests */}
        <div className="card overflow-hidden border-orange-100/50 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <span className="w-2 h-8 bg-orange-500 rounded-full mr-3"></span>
              Verification Requests
            </h2>
            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
              {dashboard?.pendingPayments?.length || 0} Pending
            </span>
          </div>

          {!dashboard?.pendingPayments || dashboard.pendingPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <FiGrid className="w-12 h-12 mb-3 opacity-20" />
              <p>No pending verifications</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {dashboard.pendingPayments.map((booking) => (
                <div key={booking._id} className="p-4 border border-gray-100 rounded-xl bg-gradient-to-r from-orange-50/30 to-transparent hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{booking.venue?.name || 'Deleted Venue'}</h3>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        By <span className="font-medium text-gray-900 ml-1">{booking.user?.name || 'Unknown User'}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">Rs. {booking.totalPrice}</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                        {booking.payment.method === 'bank' ? 'Bank Transfer' : 'eSewa'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-3 border-t border-orange-100">
                    <button onClick={() => handleVerifyPayment(booking._id)} className="flex-1 btn bg-green-500 hover:bg-green-600 text-white text-xs py-2 h-9 shadow-sm shadow-green-200">Verify</button>
                    <button onClick={() => handleRejectPayment(booking._id)} className="flex-1 btn bg-red-500 hover:bg-red-600 text-white text-xs py-2 h-9 shadow-sm shadow-red-200">Reject</button>
                    <button onClick={() => handleDeleteBooking(booking._id)} className="px-3 btn bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs py-2 h-9">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Venues */}
        <div className="card overflow-hidden border-indigo-100/50 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <span className="w-2 h-8 bg-indigo-500 rounded-full mr-3"></span>
              New Venues
            </h2>
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
              {dashboard?.pendingVenues?.length || 0} Pending
            </span>
          </div>

          {!dashboard?.pendingVenues || dashboard.pendingVenues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <FiMapPin className="w-12 h-12 mb-3 opacity-20" />
              <p>No venues awaiting approval</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {dashboard.pendingVenues.map((venue) => (
                <div key={venue._id} className="p-4 border border-gray-100 rounded-xl bg-gradient-to-r from-indigo-50/30 to-transparent hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{venue.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Owner: <span className="font-medium text-gray-900">{venue.owner?.name || 'Deleted Owner'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-3 border-t border-indigo-100">
                    <button onClick={() => handleApproveVenue(venue._id)} className="flex-1 btn bg-indigo-500 hover:bg-indigo-600 text-white text-xs py-2 h-9 shadow-sm shadow-indigo-200">Approve Venue</button>
                    <button onClick={() => handleDeleteVenue(venue._id)} className="px-3 btn bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 text-xs py-2 h-9">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Revenue Statement */}
      <div className="card overflow-hidden border-emerald-100/50 bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="w-2 h-8 bg-emerald-500 rounded-full mr-3"></span>
            Revenue Details
          </h2>
          <button onClick={handleExportReport} className="text-sm text-emerald-600 font-medium hover:text-emerald-700 transition-colors">Export Report</button>
        </div>

        {!revenueData || revenueData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <FiDollarSign className="w-12 h-12 mb-3 opacity-20" />
            <p>No revenue data available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner Details</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stats</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {revenueData.map((item, index) => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm mr-3">
                          {item.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{item.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">{item.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{item.totalBookings} <span className="text-gray-400 font-normal">bookings</span></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full inline-block">
                        Rs. {(item.totalRevenue || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome Back, Admin
        </h1>
        <p className="text-gray-500 mt-2 text-lg">Here's what's happening with your platform today.</p>
      </div>

      <div className="mb-6 flex space-x-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100 inline-flex">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'overview' ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'messages' ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Messages
        </button>
        <button
          onClick={() => setActiveTab('kyc')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'kyc' ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          KYC
        </button>
        <button
          onClick={() => setActiveTab('footage')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'footage' ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Footage
        </button>
        <button
          onClick={() => setActiveTab('tournaments')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'tournaments' ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Tournaments
        </button>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'messages' && <CustomerMessages />}
      {activeTab === 'kyc' && <KycVerificationRequests />}
      {activeTab === 'footage' && <AdminFootage />}
      {activeTab === 'tournaments' && <ManageTournaments />}
    </div>
  );
};

export default AdminDashboard;
