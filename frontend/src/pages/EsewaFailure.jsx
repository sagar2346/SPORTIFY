import { useNavigate } from 'react-router-dom';
import { FiXCircle } from 'react-icons/fi';

const EsewaFailure = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl text-center">
        <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in-up">
          <FiXCircle className="text-rose-500 text-6xl" />
          <h2 className="text-3xl font-bold text-slate-900">Payment Failed</h2>
          <p className="text-slate-500 text-md">Your eSewa transaction was cancelled or failed to process.</p>
          <button
            onClick={() => navigate('/bookings')}
            className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            Return to Bookings
          </button>
        </div>
      </div>
    </div>
  );
};

export default EsewaFailure;
