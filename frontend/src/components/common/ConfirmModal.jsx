import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  type = "danger" // 'danger' or 'info'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 transition-all duration-300">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-scale-up border border-slate-100">
        {/* Header/Banner colored based on type */}
        <div className={`h-2 w-full ${type === 'danger' ? 'bg-red-500' : 'bg-primary-500'}`}></div>
        
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className={`p-3 rounded-2xl ${type === 'danger' ? 'bg-red-50' : 'bg-primary-50'}`}>
              <FiAlertTriangle className={`w-6 h-6 ${type === 'danger' ? 'text-red-600' : 'text-primary-600'}`} />
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
            >
              <FiX size={20} />
            </button>
          </div>

          <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-500 leading-relaxed font-medium mb-8">
            {message}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1 py-3"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`btn flex-1 py-3 text-white shadow-lg ${
                type === 'danger' 
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-200' 
                  : 'bg-primary-600 hover:bg-primary-700 shadow-primary-200'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
