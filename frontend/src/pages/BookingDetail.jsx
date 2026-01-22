import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingService } from '../services/api';
import { FiCalendar, FiClock, FiMapPin, FiDollarSign, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ReviewModal from '../components/venues/ReviewModal';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    loadBooking();
  }, [id]);

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

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setCancelling(true);
    try {
      await bookingService.cancelBooking(id, 'User requested cancellation');
      toast.success('Booking cancelled successfully');
      loadBooking();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Booking Details</h1>

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">{booking.venue?.name || 'Venue Unavailable'}</h2>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <FiCalendar className="mr-2" />
                {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="flex items-center text-gray-600">
                <FiClock className="mr-2" />
                {booking.startTime} - {booking.endTime}
              </div>
              <div className="flex items-center text-gray-600">
                <FiMapPin className="mr-2" />
                {booking.venue?.location?.address || 'N/A'}, {booking.venue?.location?.city || 'N/A'}
              </div>
              <div className="flex items-center text-gray-600">
                <FiDollarSign className="mr-2" />
                Rs. {booking.totalPrice}
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Booking Status</h3>
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 ${booking.status === 'confirmed'
                ? 'bg-green-100 text-green-800'
                : booking.payment.status === 'verification_pending'
                  ? 'bg-blue-100 text-blue-800'
                  : booking.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : booking.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                }`}
            >
              {booking.payment.status === 'verification_pending' ? 'VERIFICATION PENDING' : booking.status.toUpperCase()}
            </span>
            <p className="text-sm text-gray-600">
              Payment: {booking.payment.status === 'verification_pending' ? 'Under Review' : booking.payment.status}
            </p>
            {booking.ticket?.qrCode && (
              <div className="mt-4">
                <p className="text-sm font-semibold mb-2">Ticket QR</p>
                <img
                  src={`http://localhost:5001${booking.ticket.qrCode}`}
                  alt="QR Code"
                  className="w-32 h-32"
                />
              </div>
            )}
          </div>
        </div>

        {/* Payment Section */}
        {booking.status === 'pending' && (booking.payment.status === 'unpaid' || booking.payment.status === 'pending') && (
          <div className="mt-8 pt-6 border-t">
            {!showPayment ? (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => { setShowPayment(true); setPaymentMethod('esewa'); }}
                  className="btn bg-green-500 hover:bg-green-600 text-white text-lg px-8 py-3"
                >
                  Pay via eSewa
                </button>
                <button
                  onClick={() => { setShowPayment(true); setPaymentMethod('bank_transfer'); }}
                  className="btn bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-3"
                >
                  Pay via Bank Transfer
                </button>
              </div>
            ) : (
              <div className="animate-fade-in-down">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">
                    {paymentMethod === 'esewa' ? 'eSewa Payment' : 'Bank Transfer'}
                  </h2>
                  <button
                    onClick={() => setShowPayment(false)}
                    className="text-sm text-primary-600 hover:underline"
                  >
                    Change Payment Method
                  </button>
                </div>

                <div className="flex justify-center mb-6">
                  {paymentMethod === 'esewa' ? (
                    <div className="card bg-gray-50 text-center max-w-sm w-full">
                      <img
                        src="/esewa-qr.png"
                        alt="eSewa QR"
                        className="mx-auto mb-2 rounded-lg w-64 h-64 object-contain bg-white"
                      />
                      <p className="text-lg font-bold mt-2">Sagar Dahal</p>
                      <p className="text-xl font-bold text-green-600">9827927767</p>
                      <p className="text-sm text-gray-600">Scan or use number to pay</p>
                    </div>
                  ) : (
                    <div className="card bg-gray-50 text-center max-w-sm w-full">
                      <img
                        src="/bank-qr.png"
                        alt="NIMB QR"
                        className="mx-auto mb-2 rounded-lg w-64 h-64 object-contain bg-white"
                      />
                      <p className="text-lg font-bold mt-2">NIMB Bank</p>
                      <p className="text-sm text-gray-600">Scan to pay directly</p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-blue-800 mb-2">Payment Instructions:</h4>
                  <ol className="list-decimal list-inside text-blue-700 space-y-1">
                    <li>Scan the QR code above.</li>
                    <li>Pay the total amount: <strong>Rs. {booking.totalPrice}</strong></li>
                    <li>Include your Booking ID in the remarks: <strong>{booking._id.slice(-6)}</strong></li>
                    <li>Click the buttons below once completed.</li>
                  </ol>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowPayment(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const toastId = toast.loading('Submitting payment details...');
                        await bookingService.requestPaymentVerification(id, paymentMethod);
                        toast.success('Payment submitted! Waiting for admin verification.', { id: toastId });

                        // Force reload to update UI
                        setTimeout(() => {
                          window.location.reload();
                        }, 1000);
                      } catch (err) {
                        console.error(err);
                        toast.error(err.response?.data?.message || 'Failed to submit payment.');
                      }
                    }}
                    className="btn btn-primary text-lg px-8"
                  >
                    I Have Made the Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {(booking.status === 'completed' || booking.status === 'confirmed') && !booking.isReviewed && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowReviewModal(true)}
            className="btn btn-primary px-8 py-3 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            <FiStar className="mr-2" />
            Rate this Venue
          </button>
        </div>
      )}

      {/* Re-add Cancel Button Logic */}
      {booking.status !== 'cancelled' && booking.status !== 'completed' && booking.status !== 'confirmed' && (
        <div className="flex space-x-4">
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="btn btn-danger"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Booking'}
          </button>
        </div>
      )}

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        bookingId={id}
        venueId={booking.venue?._id}
        onSuccess={() => {
          loadBooking(); // Reload to perhaps hide the button if we track 'isReviewed' later
          setShowReviewModal(false);
        }}
      />
    </div>
  );
};

export default BookingDetail;

