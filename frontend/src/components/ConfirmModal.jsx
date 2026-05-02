import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Delete", 
  cancelText = "Cancel",
  variant = "danger" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onCancel}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-[#282828] border border-white/10 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full shrink-0 ${variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
              <AlertCircle size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white mb-2 leading-tight">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
            </div>
            <button 
              onClick={onCancel}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-white/5 border-t border-white/5">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-sm font-bold text-white hover:scale-105 transition-all"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-6 py-2 rounded-full text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg ${variant === 'danger' ? 'bg-red-500 hover:bg-red-400' : 'bg-green-500 hover:bg-green-400 text-black'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
