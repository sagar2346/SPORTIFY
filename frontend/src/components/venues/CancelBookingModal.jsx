import { FiAlertTriangle, FiX } from 'react-icons/fi';

const CancelBookingModal = ({ isOpen, onClose, onConfirm, loading, refundInfo, isConfirmed }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 relative animate-scale-up border border-slate-100 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-xl"
        >
          <FiX size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-2">
            <FiAlertTriangle className="text-rose-500 text-4xl" />
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight text-center">Cancel Booking?</h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed px-4">
              {isConfirmed 
                ? `Are you sure you want to cancel this confirmed booking? Based on the time remaining, you are eligible for a ${refundInfo}.`
                : 'Are you sure you want to cancel this booking? This action cannot be undone.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full pt-4">
            <button
              onClick={onClose}
              className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all active:scale-95"
            >
              No, Keep it
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-6 py-4 bg-rose-500 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                'Yes, Cancel'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;
