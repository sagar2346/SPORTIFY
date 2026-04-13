import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingService, paymentService, userService } from '../services/api';
import { FiCalendar, FiClock, FiMapPin, FiDollarSign, FiStar, FiDownload, FiUser, FiMail, FiCheckCircle, FiBriefcase } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import ReviewModal from '../components/venues/ReviewModal';
import CancelBookingModal from '../components/venues/CancelBookingModal';
import ConfirmModal from '../components/common/ConfirmModal';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [refundInfo, setRefundInfo] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [isPayingWithWallet, setIsPayingWithWallet] = useState(false);
  const [showWalletConfirm, setShowWalletConfirm] = useState(false);

  const handleEsewaPayment = async () => {
    setIsProcessingPayment(true);
    try {
      const response = await paymentService.initiateEsewaPayment(id);
      if (response.data.success) {
        const { formData, esewaUrl } = response.data;

        // Create a hidden form dynamically and submit it to eSewa
        const form = document.createElement('form');
        form.setAttribute('method', 'POST');
        form.setAttribute('action', esewaUrl);

        for (const key in formData) {
          const hiddenField = document.createElement('input');
          hiddenField.setAttribute('type', 'hidden');
          hiddenField.setAttribute('name', key);
          hiddenField.setAttribute('value', formData[key]);
          form.appendChild(hiddenField);
        }

        document.body.appendChild(form);
        form.submit();
      } else {
        toast.error('Failed to initialize payment');
        setIsProcessingPayment(false);
      }
    } catch (error) {
      console.error('eSewa init error:', error);
      toast.error(error.response?.data?.message || 'Error occurred while starting payment');
      setIsProcessingPayment(false);
    }
  };

  useEffect(() => {
    loadBooking();
    if (currentUser) {
      loadWalletBalance();
    }
  }, [id, currentUser]);

  const loadWalletBalance = async () => {
    try {
      const response = await userService.getProfile();
      if (response.data.success) {
        setWalletBalance(response.data.data.walletBalance || 0);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const onConfirmWalletPayment = async () => {
    setShowWalletConfirm(false);
    handleWalletPayment();
  };

  const handleWalletPayment = async () => {
    if (walletBalance < booking.totalPrice) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setIsPayingWithWallet(true);
    try {
      const response = await bookingService.payWithWallet(id);
      if (response.data.success) {
        toast.success('Payment successful via Wallet!');
        loadBooking();
      }
    } catch (error) {
      console.error('Wallet payment error:', error);
      toast.error(error.response?.data?.message || 'Error occurred during wallet payment');
    } finally {
      setIsPayingWithWallet(false);
    }
  };

  const loadBooking = async () => {
    try {
      const response = await bookingService.getBooking(id);
      setBooking(response.data.data);
    } catch (error) {
      console.error('Error loading booking:', error);
      toast.error('Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    const hoursUntilBooking = (new Date(booking.bookingDate) - new Date()) / (1000 * 60 * 60);
    setRefundInfo(hoursUntilBooking >= 24 ? "100% refund" : "50% refund");
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      await bookingService.cancelBooking(id, 'User requested cancellation');
      toast.success('Booking cancelled successfully');
      setShowCancelModal(false);
      loadBooking();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const handleDownload = async () => {
    try {
      const toastId = toast.loading('Preparing your ticket...');
      const response = await bookingService.downloadTicket(id);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${id.slice(-6)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Ticket downloaded successfully!', { id: toastId });
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download ticket. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!booking) {
    return <div className="text-center py-12">Booking not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 sm:px-12 py-16 transition-colors duration-300">
      <div className="mb-14 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight text-center">Booking summary</h1>
          <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-widest ">Review your session details and complete payment if required</p>
        </div>
        {(booking.status === 'pending' || booking.status === 'confirmed') && (
          <button
            onClick={handleCancelClick}
            disabled={cancelling}
            className="px-6 py-3 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
          >
            {cancelling ? 'Cancelling...' : 'Cancel booking'}
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-100 shadow-2xl rounded-[3rem] overflow-hidden mb-12 p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                {booking.venue?.name || 'Venue unavailable'}
              </h2>
            </div>
            <div className="space-y-5">
              <div className="flex items-center text-slate-600 font-bold bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <FiCalendar className="mr-5 text-slate-400 text-xl" />
                <span className="text-sm">
                  {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center text-slate-600 font-bold bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <FiClock className="mr-5 text-slate-400 text-xl" />
                <span className="text-sm">{booking.startTime} - {booking.endTime}</span>
              </div>
              <div className="flex items-center text-slate-600 font-bold bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <FiMapPin className="mr-5 text-slate-400 text-xl" />
                <span className="text-sm">{booking.venue?.location?.address || 'N/A'}, {booking.venue?.location?.city || 'N/A'}</span>
              </div>
              <div className="flex items-center text-slate-900 font-bold text-3xl pt-6">
                <span className="text-3xl font-bold text-slate-900 tracking-tighter">Rs. {booking.totalPrice}</span>
              </div>

              {currentUser?.role === 'venue_owner' && (
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mt-8">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Customer information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center text-slate-900 font-bold text-sm">
                      <FiUser className="mr-4 text-slate-400" />
                      <span>{booking.user?.name}</span>
                    </div>
                    <div className="flex items-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                      <FiMail className="mr-4 text-slate-300" />
                      <span>{booking.user?.email}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col justify-between space-y-10">
            <div className="space-y-8">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 ml-1">Booking status</h3>
                <span
                  className={`inline-block px-5 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase border ${booking.status === 'confirmed'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                    : booking.payment.status === 'verification_pending'
                      ? 'bg-amber-50 text-amber-600 border-amber-100'
                      : booking.status === 'pending'
                        ? 'bg-slate-50 text-slate-400 border-slate-200'
                        : booking.status === 'cancelled'
                          ? 'bg-rose-50 text-rose-600 border-rose-100'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}
                >
                  {booking.payment.status === 'verification_pending' ? 'Verification pending' : booking.status}
                </span>
              </div>
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Payment status</p>
                <p className="text-lg font-bold text-slate-900 tracking-tight">
                  {booking.payment.status === 'verification_pending' ? 'Under review' : booking.payment.status}
                </p>
              </div>

              {/* AI Prominent Review Section */}
              <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-900/20 flex flex-col items-center justify-center text-center">
                {(booking.status === 'completed' || booking.status === 'confirmed') ? (
                  currentUser?.role !== 'customer' ? (
                    <div className="opacity-50 flex flex-col items-center">
                      <FiStar className="text-slate-500 mb-3" size={24} />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Reviews are for customers</p>
                    </div>
                  ) : !booking.isReviewed ? (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-3 mb-4 text-yellow-400">
                        <FiStar size={20} className="animate-pulse fill-current" />
                        <h3 className="text-lg font-bold tracking-tight text-white">Rate Venue</h3>
                      </div>
                      <button
                        onClick={() => setShowReviewModal(true)}
                        className="px-8 py-3.5 bg-white text-slate-900 rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-yellow-400 transition-all active:scale-95 flex items-center gap-2"
                      >
                        Write Review
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-emerald-400">
                      <FiCheckCircle className="mb-2" size={24} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Review Submitted</span>
                    </div>
                  )
                ) : (
                  <div className="opacity-40 flex flex-col items-center">
                    <FiStar className="text-slate-500 mb-3" size={24} />
                    <p className="text-[10px] font-bold uppercase tracking-widest leading-loose">
                      {booking.status === 'pending' ? 'Locked' : 'N/A'}
                    </p>
                  </div>
                )}
              </div>
            </div>
            {booking.ticket?.qrCode && (
              <div className="mt-6 text-center lg:text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Ticket QR code</p>
                <div className="p-4 bg-white rounded-3xl border border-slate-100 inline-block shadow-sm">
                  <img
                    src={`http://localhost:5001${booking.ticket.qrCode}`}
                    alt="QR Code"
                    className="w-32 h-32 opacity-90"
                  />
                </div>
              </div>
            )}
          </div>
        </div>



        {/* Payment Section */}
        {booking.status === 'pending' && (booking.payment.status === 'unpaid' || booking.payment.status === 'pending') && (
          <div className="mt-16 pt-12 border-t border-slate-100/50 text-center">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-4">Complete your payment</h3>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-8">Pay securely via eSewa to confirm your booking</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {/* eSewa Payment */}
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={handleEsewaPayment}
                  disabled={isProcessingPayment || isPayingWithWallet}
                  className="px-10 py-5 bg-[#61bb46] hover:bg-[#4da638] text-white rounded-2xl font-bold uppercase tracking-widest text-[11px] transition-all shadow-lg shadow-[#61bb46]/20 active:scale-95 disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    'Pay with eSewa'
                  )}
                </button>
                <p className="text-[9px] text-slate-400">Secure redirect to eSewa</p>
              </div>

              {/* Wallet Payment */}
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => setShowWalletConfirm(true)}
                  disabled={isProcessingPayment || isPayingWithWallet || walletBalance < booking.totalPrice}
                  className={`px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-[11px] transition-all active:scale-95 flex items-center gap-2 border ${
                    walletBalance >= booking.totalPrice 
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800' 
                      : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                  }`}
                >
                  {isPayingWithWallet ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Paying...
                    </>
                  ) : (
                    <>
                      <FiBriefcase size={16} />
                      Pay with Wallet
                    </>
                  )}
                </button>
                <p className={`text-[9px] font-bold ${walletBalance >= booking.totalPrice ? 'text-emerald-500' : 'text-rose-400'}`}>
                  Balance: Rs. {walletBalance.toLocaleString()}
                </p>
              </div>
            </div>
            
            <p className="text-[10px] items-center mt-8 text-slate-400 max-w-sm mx-auto">Choose your preferred payment method to confirm your booking.</p>
          </div>
        )}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
        {booking.status === 'confirmed' && (
          <button
            onClick={handleDownload}
            className="px-10 py-5 border-2 border-slate-100 text-slate-900 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center"
          >
            <FiDownload className="mr-3 text-lg" />
            Download ticket pdf
          </button>
        )}
      </div>

      <ConfirmModal 
        isOpen={showWalletConfirm}
        onClose={() => setShowWalletConfirm(false)}
        onConfirm={onConfirmWalletPayment}
        title="Confirm Wallet Payment"
        message={`Are you sure you want to use your wallet money (रू ${booking?.totalPrice?.toLocaleString()}) for this booking? This will be deducted from your रू ${walletBalance.toLocaleString()} balance.`}
        confirmText="Yes, Pay Now"
        cancelText="Cancel"
        type="info"
      />

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        bookingId={id}
        venueId={booking.venue?._id}
        onSuccess={() => {
          loadBooking();
          setShowReviewModal(false);
        }}
      />
      <CancelBookingModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        loading={cancelling}
        refundInfo={refundInfo}
        isConfirmed={booking.status === 'confirmed'}
      />
    </div>
  );
};

export default BookingDetail;
