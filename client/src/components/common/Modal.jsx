import { HiX } from 'react-icons/hi';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Modal */}
      <div
        className={`relative ${maxWidth} w-full bg-dark-800 border border-dark-600 rounded-2xl p-6 animate-fade-in-up max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center text-dark-300 
                       hover:text-white hover:bg-dark-600 transition-colors"
          >
            <HiX />
          </button>
        </div>
        
        {children}
      </div>
    </div>
  );
}
