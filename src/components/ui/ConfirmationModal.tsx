'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface ConfirmationModalProps {
  isVisible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'danger' | 'info';
}

export default function ConfirmationModal({
  isVisible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'warning'
}: ConfirmationModalProps) {
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
      case 'danger':
        return {
          icon: (
            <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-pink-500 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          ),
          confirmBg: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
          confirmShadow: 'shadow-red-500/25 hover:shadow-red-500/40',
          borderColor: 'border-red-500/30',
          bgGradient: 'from-red-500/20 to-red-600/20'
        };
      case 'info':
        return {
          icon: (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
          ),
          confirmBg: 'from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700',
          confirmShadow: 'shadow-accent-500/25 hover:shadow-accent-500/40',
          borderColor: 'border-accent-500/30',
          bgGradient: 'from-accent-500/20 to-accent-600/20'
        };
      default: // warning
        return {
          icon: (
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          ),
          confirmBg: 'from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700',
          confirmShadow: 'shadow-primary-500/25 hover:shadow-primary-500/40',
          borderColor: 'border-primary-500/30',
          bgGradient: 'from-primary-500/20 to-primary-600/20'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onCancel}>
          <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-secondary-800/95 backdrop-blur-xl rounded-3xl border border-secondary-700/50 shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${styles.bgGradient} border-b ${styles.borderColor} p-6 rounded-t-3xl`}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    {styles.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <p className="text-secondary-300 text-sm">Please confirm your action</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-secondary-300 leading-relaxed mb-6">
                  {message}
                </p>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={onCancel}
                    className="flex-1 px-6 py-3 bg-secondary-700/50 hover:bg-secondary-600/50 text-secondary-300 hover:text-white rounded-xl transition-all duration-300 font-medium border border-secondary-600/50 hover:border-secondary-500/50"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={onConfirm}
                    className={`flex-1 px-6 py-3 bg-gradient-to-r ${styles.confirmBg} text-white rounded-xl transition-all duration-300 font-medium shadow-lg ${styles.confirmShadow} hover:scale-105 transform`}
                  >
                    {confirmText}
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
