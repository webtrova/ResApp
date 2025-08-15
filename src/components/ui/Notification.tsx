'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationProps {
  isVisible: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  onClose: () => void;
  duration?: number;
}

export default function Notification({
  isVisible,
  type,
  title,
  message,
  onClose,
  duration = 5000
}: NotificationProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isVisible) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isVisible]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: (
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          ),
          bgGradient: 'from-green-500/20 to-emerald-600/20',
          borderColor: 'border-green-500/30',
          textColor: 'text-green-100'
        };
      case 'error':
        return {
          icon: (
            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/25">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          ),
          bgGradient: 'from-red-500/20 to-pink-600/20',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-100'
        };
      case 'warning':
        return {
          icon: (
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/25">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          ),
          bgGradient: 'from-yellow-500/20 to-orange-600/20',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-100'
        };
      case 'info':
        return {
          icon: (
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
          ),
          bgGradient: 'from-accent-500/20 to-cyan-600/20',
          borderColor: 'border-accent-500/30',
          textColor: 'text-accent-100'
        };
      default:
        return {
          icon: (
            <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-500/25">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
          ),
          bgGradient: 'from-secondary-500/20 to-gray-600/20',
          borderColor: 'border-secondary-500/30',
          textColor: 'text-secondary-100'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999]" onClick={onClose}>
          <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-secondary-800/95 backdrop-blur-xl rounded-3xl border border-secondary-700/50 shadow-2xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${styles.bgGradient} border-b ${styles.borderColor} p-6 rounded-t-3xl`}>
                <div className="flex items-center space-x-4">
                  {styles.icon}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <p className="text-secondary-300 text-sm">Notification</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white/70 hover:text-white transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {message && (
                  <p className="text-secondary-300 leading-relaxed mb-6">{message}</p>
                )}
                
                <div className="flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-secondary-700/50 hover:bg-secondary-600/50 text-secondary-300 hover:text-white rounded-xl transition-all duration-300 font-medium border border-secondary-600/50 hover:border-secondary-500/50"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
