import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/api';
import { FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await bookingService.getBookings();
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (e, id) => {
    e.preventDefault(); // Prevent navigating to detail page
    e.stopPropagation(); // Ensure event doesn't bubble

    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingService.cancelBooking(id, 'User requested cancellation');
      toast.success('Booking cancelled successfully');
      loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No bookings found.</p>
          <Link to="/venues" className="btn btn-primary">
            Browse Venues
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Link
              key={booking._id}
              to={`/bookings/${booking._id}`}
              className="card hover:shadow-lg transition-shadow block"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    {booking.venue?.name || 'Venue Unavailable'}
                  </h3>
                  <div className="space-y-1 text-gray-600">
                    <div className="flex items-center">
                      <FiCalendar className="mr-2" />
                      {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex items-center">
                      <FiClock className="mr-2" />
                      {booking.startTime} - {booking.endTime}
                    </div>
                    <div className="flex items-center">
                      <FiMapPin className="mr-2" />
                      {booking.venue?.location?.city || 'N/A'}, {booking.venue?.location?.state || 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600 mb-2">
                    Rs. {booking.totalPrice}
                  </p>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : booking.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                    >
                      {booking.status}
                    </span>
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button
                        onClick={(e) => handleCancel(e, booking._id)}
                        className="text-sm text-red-600 hover:text-red-800 font-medium underline"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;

