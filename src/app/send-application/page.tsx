'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, FileText, Send, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Navigation from '../../components/ui/Navigation';
import DocumentSelector from '../../components/email/DocumentSelector';
import EmailSender from '../../components/email/EmailSender';
import Notification from '../../components/ui/Notification';

interface SavedDocument {
  id: string;
  title: string;
  description?: string;
  updated_at: string;
  resume_data?: any;
  cover_letter_data?: any;
  type: 'resume' | 'cover_letter';
}

export default function SendApplication() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [selectedResume, setSelectedResume] = useState<SavedDocument | null>(null);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<SavedDocument | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message?: string;
  }>({
    isVisible: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Redirect if not authenticated
  if (!isLoading && !user) {
    router.push('/login');
    return null;
  }

  const handleDocumentsSelected = (resume: SavedDocument | null, coverLetter: SavedDocument | null) => {
    setSelectedResume(resume);
    setSelectedCoverLetter(coverLetter);
    setShowEmailForm(true);
  };

  const handleBackToSelection = () => {
    setShowEmailForm(false);
    setSelectedResume(null);
    setSelectedCoverLetter(null);
  };

  const handleEmailSent = () => {
    setNotification({
      isVisible: true,
      type: 'success',
      title: 'Email Prepared Successfully!',
      message: 'Your default email client has been opened. Please attach the documents and send your application.'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 text-white">
      {/* Header */}
      <Navigation currentPage="send-application" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-4 py-2 bg-primary-500/20 text-primary-300 rounded-full text-sm font-medium mb-6 border border-primary-500/30"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Job Application
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6"
          >
            Send Your
            <span className="block bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              Application
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-secondary-300 max-w-3xl mx-auto leading-relaxed"
          >
            Select your resume and cover letter, then send them via email to potential employers
          </motion.p>
        </div>

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push('/dashboard')}
          className="flex items-center space-x-2 text-secondary-300 hover:text-white transition-colors duration-300 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </motion.button>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {!showEmailForm ? (
            <DocumentSelector onDocumentsSelected={handleDocumentsSelected} />
          ) : (
            <div className="space-y-6">
              {/* Selected Documents Summary */}
              <div className="bg-secondary-800/50 rounded-2xl border border-secondary-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Selected Documents</h3>
                  <button
                    onClick={handleBackToSelection}
                    className="text-secondary-300 hover:text-white transition-colors duration-300 flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Change Selection</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedResume && (
                    <div className="bg-secondary-700/30 rounded-lg p-4 border border-secondary-600/50">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <div>
                          <h4 className="text-white font-medium">{selectedResume.title}</h4>
                          <p className="text-secondary-400 text-sm">
                            Updated: {new Date(selectedResume.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedCoverLetter && (
                    <div className="bg-secondary-700/30 rounded-lg p-4 border border-secondary-600/50">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-green-400" />
                        <div>
                          <h4 className="text-white font-medium">{selectedCoverLetter.title}</h4>
                          <p className="text-secondary-400 text-sm">
                            Updated: {new Date(selectedCoverLetter.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Email Form */}
              <EmailSender
                resumeData={selectedResume?.resume_data}
                coverLetterData={selectedCoverLetter?.cover_letter_data}
                jobDetails={{}}
              />
            </div>
          )}
        </motion.div>

        {/* Notification */}
        <Notification
          isVisible={notification.isVisible}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
        />
      </div>
    </div>
  );
}
