import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentService } from '../services/api';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiLoader } from 'react-icons/fi';

const EsewaSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [bookingId, setBookingId] = useState(null);
  const [paymentType, setPaymentType] = useState('booking'); // booking, fine, tournament

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const data = searchParams.get('data');
        if (!data) {
          setStatus('error');
          toast.error('Invalid payment callback data');
          return;
        }

        const response = await paymentService.verifyEsewaPayment(data);
        if (response.data.success) {
          setStatus('success');
          if (response.data.type === 'fine') {
            setBookingId(response.data.teamId); // Reusing state for ID
            setPaymentType('fine');
            toast.success('Fine paid and team unblocked!');
          } else if (response.data.type === 'tournament') {
            setBookingId(response.data.tournamentId);
            setPaymentType('tournament');
            toast.success('Tournament registration successful!');
          } else {
            setBookingId(response.data.bookingId);
            setPaymentType('booking');
            toast.success('Payment successful and booking confirmed!');
          }
        } else {
          setStatus('error');
          toast.error(response.data.message || 'Payment verification failed');
        }
      } catch (error) {
        console.error('eSewa verification error:', error);
        setStatus('error');
        toast.error(error.response?.data?.message || 'Error verifying payment');
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl text-center">
        {status === 'verifying' && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <FiLoader className="animate-spin text-emerald-500 text-6xl" />
            <h2 className="text-2xl font-bold text-slate-900">Verifying Payment...</h2>
            <p className="text-slate-500 text-sm">Please wait while we confirm your transaction with eSewa.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center justify-center space-y-8 py-4 animate-fade-in-up">
            <div className="relative">
              <div className="absolute -inset-4 bg-emerald-100 rounded-full animate-ping opacity-25"></div>
              <FiCheckCircle className="text-emerald-500 text-7xl relative" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
                {paymentType === 'tournament' ? 'Registration Successful!' : 'Booking Successful!'}
              </h2>
              <p className="text-slate-500 text-lg font-medium max-w-xs mx-auto">
                {paymentType === 'fine' 
                  ? 'Your fine has been paid and your team is now unblocked.' 
                  : paymentType === 'tournament'
                  ? 'Your spot in the tournament is officially secured.'
                  : 'Your slot is secured and your digital ticket is ready.'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 w-full pt-4">
              <button
                onClick={() => {
                  if (paymentType === 'fine') navigate(`/teams/${bookingId}/chat`);
                  else if (paymentType === 'tournament') navigate(`/tournaments/${bookingId}`);
                  else navigate(`/bookings/${bookingId}`);
                }}
                className="w-full px-8 py-5 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/10 active:scale-95"
              >
                {paymentType === 'fine' ? 'View Team Chat' : paymentType === 'tournament' ? 'View Tournament' : 'Get Digital Ticket'}
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full px-8 py-5 bg-slate-100 text-slate-600 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all active:scale-95"
              >
                Go to Home
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in-up">
            <div className="text-rose-500 text-6xl">✕</div>
            <h2 className="text-2xl font-bold text-slate-900">Verification Failed</h2>
            <p className="text-slate-500 text-md">We could not verify your payment. If money was deducted, please contact support.</p>
            <button
              onClick={() => navigate('/bookings')}
              className="mt-8 px-8 py-4 bg-slate-100 text-slate-900 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all shadow-sm active:scale-95"
            >
              Back to My Bookings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EsewaSuccess;
