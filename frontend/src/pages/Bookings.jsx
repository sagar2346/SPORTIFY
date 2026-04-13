import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/api';
import { FiCalendar, FiClock, FiMapPin, FiUser, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, listItemVariants, hoverScale, tapScale } from '../utils/motion';
import PageWrapper from '../components/layout/PageWrapper';

const Bookings = () => {
  const { user } = useAuth();
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

  const handleConfirmPayment = async (e, bookingId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await bookingService.confirmBooking(bookingId);
      toast.success('Payment confirmed successfully!');
      loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm payment');
    }
  };

  const handleCancel = async (e, bookingId) => {
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
    <div className="space-y-12">
      <div className="mb-14">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
          {user?.role === 'venue_owner' ? 'Venue bookings' : 'My bookings'}
        </h1>
        <p className="text-xs text-slate-400 mt-3 font-bold uppercase tracking-widest">Keep track of all your upcoming and past game sessions</p>
      </div>

      {bookings.length === 0 ? (
        // ... (rest of the content remains the same)
        <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8">
            <FiCalendar className="w-12 h-12 text-slate-200" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">No bookings found</h3>
          <p className="text-sm text-slate-400 font-medium mb-12">You haven't made any bookings yet.</p>
          <Link to="/venues" className="px-10 py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-slate-900/10 transition-all active:scale-95">
            Book a venue
          </Link>
        </div>
      ) : (
        <motion.div
          layout
          variants={staggerContainer(0.05, 0.1)}
          initial="hidden"
          animate="show"
          className="space-y-10"
        >
          <AnimatePresence mode="popLayout">
            {bookings.map((booking) => (
              <motion.div
                layout
                key={booking._id}
                variants={listItemVariants}
                exit={{ opacity: 0, x: -50 }}
              >
                <Link
                  to={`/bookings/${booking._id}`}
                  className="bg-white border border-slate-100 rounded-[2.5rem] p-10 hover:shadow-2xl hover:border-slate-900/10 transition-all block group relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                    <div className="flex-1 space-y-8">
                      <div>
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight group-hover:text-slate-600 transition-colors">
                          {booking.venue?.name || 'Venue unavailable'}
                        </h3>
                        {user?.role === 'venue_owner' && (
                          <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">
                            <FiUser className="mr-2" /> Customer: <span className="text-slate-900 ml-1.5">{booking.user?.name}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-8">
                        <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-100">
                          <FiCalendar className="mr-3 text-slate-900" />
                          {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-100">
                          <FiClock className="mr-3 text-slate-900" />
                          {booking.startTime} - {booking.endTime}
                        </div>
                        <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-100">
                          <FiMapPin className="mr-3 text-slate-900" />
                          {booking.venue?.location?.city || 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between gap-6 pt-10 md:pt-0 border-t md:border-t-0 border-slate-50">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total amount</p>
                        <span className="text-3xl font-bold text-slate-900 tracking-tighter">
                          Rs. {booking.totalPrice}
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-5">
                        <span
                          className={`px-5 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest border ${booking.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                            : booking.status === 'pending'
                              ? 'bg-amber-50 text-amber-600 border-amber-100'
                              : booking.status === 'cancelled'
                                ? 'bg-rose-50 text-rose-600 border-rose-100'
                                : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}>
                          {booking.status}
                        </span>
                        {booking.status === 'pending' && user?.role === 'venue_owner' && (
                          <button
                            onClick={(e) => handleConfirmPayment(e, booking._id)}
                            className="flex items-center text-[10px] text-white hover:bg-slate-800 font-bold bg-slate-900 px-6 py-3 rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-slate-900/10 active:scale-95"
                          >
                            <FiCheckCircle className="mr-2" /> Confirm
                          </button>
                        )}
                        {booking.status === 'pending' && user?.role === 'customer' && (
                          <button
                            onClick={(e) => handleCancel(e, booking._id)}
                            className="text-[10px] text-rose-500 hover:text-rose-700 font-bold uppercase tracking-widest bg-rose-50 px-6 py-3 rounded-xl border border-rose-100/50 transition-all active:scale-95"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default Bookings;
