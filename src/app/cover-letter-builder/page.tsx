'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Briefcase, Settings, Eye, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Navigation from '../../components/ui/Navigation';
import CoverLetterForm from '../../components/cover-letter/CoverLetterForm';
import CoverLetterPreview from '../../components/cover-letter/CoverLetterPreview';
import JobDetailsForm from '../../components/cover-letter/JobDetailsForm';
import CoverLetterOptions from '../../components/cover-letter/CoverLetterOptions';
import Notification from '../../components/ui/Notification';
import { ResumeData, CoverLetterData, JobDetails } from '../../types/resume';

export default function CoverLetterBuilder() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [coverLetterData, setCoverLetterData] = useState<CoverLetterData | null>(null);
  const [coverLetterOptions, setCoverLetterOptions] = useState<{
    tone: 'professional' | 'enthusiastic' | 'confident' | 'formal';
    focus: 'experience' | 'skills' | 'achievements' | 'motivation' | 'balanced';
    length: 'brief' | 'standard' | 'detailed';
  }>({
    tone: 'professional',
    focus: 'balanced',
    length: 'standard'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingResume, setIsLoadingResume] = useState(true);
  const [direction, setDirection] = useState(0);
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
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Load user's resume data
  useEffect(() => {
    if (user) {
      loadResumeData();
    }
  }, [user]);

  const loadResumeData = async () => {
    setIsLoadingResume(true);
    setError(null);
    
    if (!user?.id) {
      setIsLoadingResume(false);
      return;
    }
    
    try {
      const authToken = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`/api/resume/load?userId=${user.id}`, {
        method: 'GET',
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Resume load response:', data);
        
        if (data.success) {
          if (data.resume && data.resume.resume_data) {
            // Single resume response
            setResumeData(data.resume.resume_data);
            console.log('Loaded single resume data');
          } else if (data.resumes && data.resumes.length > 0) {
            // Multiple resumes response - use the most recent one
            const latestResume = data.resumes[0];
            setResumeData(latestResume.resume_data);
            console.log('Loaded latest resume from multiple resumes');
          } else {
            console.log('No resume data found in response');
            setError('No resume found. Please create a resume first in the Builder section.');
          }
        } else {
          console.log('Resume load was not successful');
          setError('No resume found. Please create a resume first in the Builder section.');
        }
      } else {
        const errorData = await response.json();
        console.error('Resume load failed:', errorData);
        if (response.status === 404) {
          setError('No resume found. Please create a resume first in the Builder section.');
        } else {
          setError('Failed to load resume data. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error loading resume data:', error);
      setError('Failed to load resume data. Please try again.');
    } finally {
      setIsLoadingResume(false);
    }
  };

  const handleJobDetailsSubmit = (details: JobDetails) => {
    setJobDetails(details);
    setDirection(1);
    setCurrentStep(2);
    setError(null);
  };

  const handleOptionsSubmit = (options: typeof coverLetterOptions) => {
    setCoverLetterOptions(options);
    setDirection(1);
    setCurrentStep(3);
    setError(null);
  };

  const goToStep = (stepNumber: number) => {
    const newDirection = stepNumber > currentStep ? 1 : -1;
    setDirection(newDirection);
    setCurrentStep(stepNumber);
  };

  const generateCoverLetter = async () => {
    if (!resumeData) {
      setError('No resume data found. Please create a resume first in the Builder section.');
      return;
    }

    if (!jobDetails) {
      setError('Please complete the job details first.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const authToken = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch('/api/cover-letter/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          resumeData,
          jobDetails,
          ...coverLetterOptions
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCoverLetterData(data.coverLetter);
        setDirection(1);
        setCurrentStep(4);
        setNotification({
          isVisible: true,
          type: 'success',
          title: 'Cover Letter Generated!',
          message: 'Your personalized cover letter has been created successfully.'
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate cover letter');
      }
    } catch (error) {
      console.error('Error generating cover letter:', error);
      setError('Failed to generate cover letter. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCoverLetterUpdate = (updatedData: CoverLetterData) => {
    setCoverLetterData(updatedData);
  };

  const saveCoverLetter = async () => {
    if (!coverLetterData) return;

    try {
      const authToken = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch('/api/cover-letter/save', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: `Cover Letter - ${jobDetails?.jobTitle} at ${jobDetails?.companyName}`,
          coverLetterData
        }),
      });

      if (response.ok) {
        setNotification({
          isVisible: true,
          type: 'success',
          title: 'Cover Letter Saved!',
          message: 'Your cover letter has been saved successfully.'
        });
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving cover letter:', error);
      setError('Failed to save cover letter');
    }
  };

  if (isLoading || isLoadingResume) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-secondary-300">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const steps = [
    { 
      id: 1, 
      title: 'Job Details', 
      subtitle: 'Tell us about the position',
      icon: Briefcase,
      component: JobDetailsForm
    },
    { 
      id: 2, 
      title: 'Options', 
      subtitle: 'Customize your letter',
      icon: Settings,
      component: CoverLetterOptions
    },
    { 
      id: 3, 
      title: 'Generate', 
      subtitle: 'AI creates your letter',
      icon: Sparkles,
      component: null
    },
    { 
      id: 4, 
      title: 'Review & Save', 
      subtitle: 'Edit and finalize',
      icon: Eye,
      component: CoverLetterForm
    }
  ];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    })
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 text-white">
      {/* Header */}
      <Navigation 
        currentPage="cover-letter-builder" 
        showProgress={true} 
        currentStep={currentStep} 
        totalSteps={steps.length} 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-4 py-2 bg-primary-500/20 text-primary-300 rounded-full text-sm font-medium mb-6 border border-primary-500/30"
          >
            <Mail className="w-4 h-4 mr-2" />
            AI-Powered Cover Letter Builder
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6"
          >
            Create Professional
            <span className="block bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              Cover Letters
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-secondary-300 max-w-3xl mx-auto leading-relaxed"
          >
            Transform your resume data into compelling cover letters tailored to specific job opportunities
          </motion.p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 sm:mb-12">
          {/* Overall Progress Bar */}
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs sm:text-sm font-medium text-secondary-300">Progress</span>
              <span className="text-xs sm:text-sm font-medium text-secondary-300">{Math.round((currentStep / steps.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-secondary-700 rounded-full h-1.5 sm:h-2">
              <motion.div
                className="bg-gradient-to-r from-primary-500 to-accent-500 h-1.5 sm:h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
          
          {/* Step Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
            {steps.map((step, index) => (
              <motion.button
                key={step.id}
                onClick={() => goToStep(step.id)}
                className={`flex flex-col items-center p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 ${
                  currentStep === step.id
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                    : currentStep > step.id
                    ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                    : 'bg-secondary-800/50 text-secondary-400 border border-secondary-700/50 hover:bg-secondary-700/50 hover:border-secondary-600/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <step.icon className="w-4 h-4 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
                <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">{step.title}</span>
                {currentStep > step.id && (
                  <div className="w-1 h-1 sm:w-2 sm:h-2 bg-primary-400 rounded-full mt-0.5 sm:mt-1" />
                )}
              </motion.button>
            ))}
          </div>
          
          {/* Current Step Info */}
          <div className="text-center mt-8 sm:mt-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-secondary-400 text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
              {steps[currentStep - 1].subtitle}
            </p>
            
            {/* Step-specific tips */}
            {currentStep === 1 && (
              <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-2 sm:p-3 max-w-2xl mx-auto">
                <p className="text-primary-300 text-xs sm:text-sm">
                  💡 <strong>Tip:</strong> Provide detailed job information for the most tailored cover letter.
                </p>
              </div>
            )}
            {currentStep === 2 && (
              <div className="bg-accent-500/10 border border-accent-500/30 rounded-lg p-2 sm:p-3 max-w-2xl mx-auto">
                <p className="text-accent-300 text-xs sm:text-sm">
                  💡 <strong>Tip:</strong> Choose options that best represent your personality and the role you're applying for.
                </p>
              </div>
            )}
            {currentStep === 3 && (
              <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-2 sm:p-3 max-w-2xl mx-auto">
                <p className="text-primary-300 text-xs sm:text-sm">
                  🚀 <strong>Ready:</strong> Our AI will create a professional cover letter based on your resume and preferences.
                </p>
              </div>
            )}
            {currentStep === 4 && (
              <div className="bg-accent-500/10 border border-accent-500/30 rounded-lg p-2 sm:p-3 max-w-2xl mx-auto">
                <p className="text-accent-300 text-xs sm:text-sm">
                  🎉 <strong>Almost done!</strong> Review your cover letter and make any final adjustments.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 max-w-2xl mx-auto"
          >
            <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-red-300">Action Required</h3>
                  <p className="text-red-200">{error}</p>
                  {!resumeData && (
                    <motion.button
                      onClick={() => router.push('/builder')}
                      className="mt-3 inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Resume First
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step Content with Animation */}
        <div className="mt-8 sm:mt-12">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="relative animate-container">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 200, damping: 25 },
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.3 }
                  }}
                  className="w-full"
                >
                  <div className="bg-secondary-800/50 backdrop-blur-sm rounded-2xl border border-secondary-700/50 p-4 sm:p-8">
                    {currentStep === 1 && (
                      <JobDetailsForm 
                        onSubmit={handleJobDetailsSubmit}
                        initialData={jobDetails}
                      />
                    )}

                    {currentStep === 2 && (
                      <CoverLetterOptions
                        onSubmit={handleOptionsSubmit}
                        initialData={coverLetterOptions}
                      />
                    )}

                    {currentStep === 3 && (
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/25">
                          <Sparkles className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Ready to Generate</h3>
                        <p className="text-secondary-300 mb-8">Your AI-powered cover letter is ready to be created</p>
                        
                        <div className="bg-primary-500/10 border border-primary-500/30 rounded-2xl p-6 mb-8">
                          <div className="flex items-center mb-4">
                            <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center mr-3">
                              <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <h4 className="font-semibold text-primary-300">What we'll create:</h4>
                          </div>
                          <div className="space-y-3 text-sm text-primary-200">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-primary-400 rounded-full mr-3"></div>
                              <span>Professional opening paragraph</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-primary-400 rounded-full mr-3"></div>
                              <span>Tailored body content based on your focus</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-primary-400 rounded-full mr-3"></div>
                              <span>Compelling closing with call-to-action</span>
                            </div>
                          </div>
                        </div>
                        
                        <motion.button
                          onClick={generateCoverLetter}
                          disabled={isGenerating}
                          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 px-6 rounded-2xl hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-lg shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40"
                          whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                          whileTap={{ scale: isGenerating ? 1 : 0.98 }}
                        >
                          {isGenerating ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                              <span>Generating your cover letter...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <Sparkles className="w-6 h-6 mr-3" />
                              <span>Generate Cover Letter</span>
                            </div>
                          )}
                        </motion.button>
                      </div>
                    )}

                    {currentStep === 4 && coverLetterData && (
                      <CoverLetterForm
                        coverLetterData={coverLetterData}
                        onUpdate={handleCoverLetterUpdate}
                        onSave={saveCoverLetter}
                      />
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Live Preview Section */}
            <div className="hidden lg:block">
              {currentStep >= 4 && coverLetterData ? (
                <CoverLetterPreview coverLetterData={coverLetterData} />
              ) : (
                <div className="bg-secondary-800/50 backdrop-blur-sm rounded-2xl border border-secondary-700/50 p-8 h-[600px] flex items-center justify-center sticky top-8">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-r from-secondary-700 to-secondary-800 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-secondary-600/50">
                      <FileText className="w-12 h-12 text-secondary-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Cover Letter Preview</h3>
                    <p className="text-secondary-400">Your generated cover letter will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-secondary-800/30 backdrop-blur-sm rounded-2xl border border-secondary-700/50 p-4 sm:p-6 mt-8 sm:mt-12">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-6 sm:space-y-0">
            <motion.button
              onClick={() => {
                const newDirection = -1;
                setDirection(newDirection);
                setCurrentStep(prev => Math.max(1, prev - 1));
              }}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 text-sm sm:text-base ${
                currentStep === 1 
                  ? 'bg-secondary-800/50 text-secondary-500 cursor-not-allowed'
                  : 'bg-secondary-700 text-white hover:bg-secondary-600 shadow-lg hover:shadow-xl'
              }`}
              whileHover={{ scale: currentStep > 1 ? 1.05 : 1 }}
              whileTap={{ scale: currentStep > 1 ? 0.95 : 1 }}
            >
              <span>←</span>
              <span className="font-medium">
                {currentStep === 1 ? 'Previous' : steps[currentStep - 2]?.title || 'Previous'}
              </span>
            </motion.button>

            <div className="flex flex-col items-center order-first sm:order-none">
              <p className="text-secondary-400 text-xs sm:text-sm mb-1">
                Step {currentStep} of {steps.length}
              </p>
              <div className="flex space-x-2 sm:space-x-3">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-colors duration-300 ${
                      index + 1 <= currentStep ? 'bg-primary-500' : 'bg-secondary-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            <motion.button
              onClick={() => {
                if (currentStep < steps.length) {
                  const newDirection = 1;
                  setDirection(newDirection);
                  setCurrentStep(prev => prev + 1);
                }
              }}
              disabled={currentStep === steps.length}
              className={`flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 font-medium text-sm sm:text-base ${
                currentStep === steps.length
                  ? 'bg-secondary-800/50 text-secondary-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl shadow-primary-500/25'
              }`}
              whileHover={{ scale: currentStep < steps.length ? 1.05 : 1 }}
              whileTap={{ scale: currentStep < steps.length ? 0.95 : 1 }}
            >
              <span>
                {currentStep === steps.length ? 'Complete' : steps[currentStep]?.title || 'Next'}
              </span>
              <span>→</span>
            </motion.button>
          </div>
        </div>

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
