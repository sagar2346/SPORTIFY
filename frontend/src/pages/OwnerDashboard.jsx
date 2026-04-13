import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { venueService, userService, bookingService } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiMapPin, FiArrowRight, FiCheckCircle, FiClock, FiUser, FiCalendar } from 'react-icons/fi';
import ConfirmModal from '../components/common/ConfirmModal';

const OwnerDashboard = () => {
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Custom Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [venuesRes, analyticsRes, bookingsRes] = await Promise.all([
        venueService.getMyVenues(),
        userService.getAnalytics(),
        bookingService.getBookings(),
      ]);
      setVenues(venuesRes.data.data);
      setAnalytics(analyticsRes.data.data);
      setBookings(bookingsRes.data.data.slice(0, 5)); // Show only 5 recent
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVenue = (venue) => {
    setVenueToDelete(venue);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!venueToDelete) return;
    
    try {
      await venueService.deleteVenue(venueToDelete._id);
      toast.success('Venue deleted successfully');
      setIsDeleteModalOpen(false);
      setVenueToDelete(null);
      loadData();
    } catch (error) {
      console.error('Error deleting venue:', error);
      toast.error('Failed to delete venue');
    }
  };

  const handleConfirmPayment = async (bookingId) => {
    try {
      await bookingService.confirmBooking(bookingId);
      toast.success('Payment confirmed and revenue updated!');
      loadData();
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error(error.response?.data?.message || 'Failed to confirm payment');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Owner Dashboard</h1>
        <Link to="/owner/add-venue" className="btn btn-primary flex items-center px-6 py-2">
          <FiPlus className="mr-2" />
          Add New Venue
        </Link>
      </div>

      {/* Analytics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl border shadow-sm border-l-4 border-l-primary-600">
            <p className="text-sm font-medium text-gray-500 mb-1">Total Venues</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.totalVenues} <span className="text-sm text-gray-400 font-normal ml-1">Properties</span></p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm border-l-4 border-l-green-600">
            <p className="text-sm font-medium text-gray-500 mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.totalBookings} <span className="text-sm text-gray-400 font-normal ml-1">Sessions</span></p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm border-l-4 border-l-amber-600">
            <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900">Rs. {analytics.totalRevenue}</p>
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden p-0 mb-12">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <FiClock className="mr-2 text-primary-600" /> Recent Bookings
          </h2>
          <Link to="/bookings" className="text-primary-600 hover:text-primary-700 font-bold text-sm">
            View All
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">
            No recent bookings found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Venue</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                          <FiUser />
                        </div>
                        <div className="text-sm font-bold text-gray-900">{booking.user?.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{booking.venue?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900 flex items-center">
                          <FiCalendar className="mr-1 text-gray-400" /> {new Date(booking.bookingDate).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500 ml-5">{booking.startTime} - {booking.endTime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">Rs. {booking.totalPrice}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${booking.payment.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : booking.payment.status === 'verification_pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                        {booking.payment.status === 'paid' ? 'Paid' : booking.payment.status === 'verification_pending' ? 'Verifying' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {(booking.payment.status === 'verification_pending' || booking.payment.status === 'pending') && (
                        <button
                          type="button"
                          onClick={() => handleConfirmPayment(booking._id)}
                          className="flex items-center ml-auto text-green-600 hover:text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 transition-all active:scale-95"
                        >
                          <FiCheckCircle className="mr-1.5" /> Confirm
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Venues List */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden p-0">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FiMapPin className="mr-2 text-primary-600" /> My Venues
          </h2>
          <div className="flex items-center gap-4">
            <Link to="/owner/my-venues" className="text-primary-600 hover:text-primary-700 font-bold text-sm">
              View All
            </Link>
            <Link to="/owner/analytics" className="text-gray-500 hover:text-gray-900 font-bold text-sm flex items-center bg-white px-4 py-2 rounded-xl transition-all border border-gray-100 shadow-sm">
              View Detailed Analytics <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>

        {venues.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiPlus className="text-3xl text-gray-300" />
            </div>
            <p className="text-gray-500 font-bold">No properties listed yet. Start by adding your first venue.</p>
          </div>
        ) : (
          <div className="divide-y">
            {venues.map((venue) => (
              <div
                key={venue._id}
                className="flex flex-col sm:flex-row justify-between items-center p-8 hover:bg-gray-50 transition-all group"
              >
                <div className="flex items-center space-x-6 w-full sm:w-auto">
                  {venue.images && venue.images.length > 0 && (
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                      <img
                        src={`http://localhost:5001${venue.images[0]}`}
                        alt={venue.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors">{venue.name}</h3>
                    <div className="flex items-center text-gray-500 text-sm mt-1">
                      <FiMapPin className="mr-1 text-primary-500" />
                      {venue.location.city}, {venue.location.state}
                    </div>
                    <span
                      className={`inline-block mt-3 px-4 py-1 rounded-full text-xs font-medium ${venue.isApproved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                        }`}
                    >
                      {venue.isApproved ? 'Approved' : 'Pending Approval'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6 sm:mt-0 w-full sm:w-auto justify-end">
                  <Link
                    to={`/owner/edit-venue/${venue._id}`}
                    className="p-3 text-gray-500 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all"
                  >
                    <FiEdit className="text-xl" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDeleteVenue(venue)}
                    className="p-3 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                  >
                    <FiTrash2 className="text-xl" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Venue"
        message={`Are you sure you want to delete "${venueToDelete?.name}"? This action will permanently remove the venue and all its associated data.`}
        confirmText="Yes, delete it"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default OwnerDashboard;
