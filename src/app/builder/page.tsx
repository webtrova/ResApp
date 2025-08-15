'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, FileText, Briefcase, GraduationCap, Zap, Eye, RotateCcw } from 'lucide-react';
import Link from 'next/link';

import { useResume } from '@/hooks/useResume';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useSmoothNavigation } from '@/hooks/useSmoothNavigation';
import { ResumeData, WorkExperience, Education } from '@/types/resume';
import ParsingResultsDisplay from '@/components/ai/ParsingResultsDisplay';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import Notification from '@/components/ui/Notification';
import Navigation from '@/components/ui/Navigation';

// Step Components
import PersonalInfoStep from '@/components/builder/PersonalInfoStep';
import SummaryStep from '@/components/builder/SummaryStep';
import ExperienceStep from '@/components/builder/ExperienceStep';
import EducationStep from '@/components/builder/EducationStep';
import SkillsStep from '@/components/builder/SkillsStep';
import ReviewStep from '@/components/builder/ReviewStep';
import LivePreview from '@/components/builder/LivePreview';

interface Step {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Personal Information",
    subtitle: "Contact details & header",
    icon: User,
    component: PersonalInfoStep
  },
  {
    id: 2,
    title: "Professional Summary",
    subtitle: "Career objective & overview",
    icon: FileText,
    component: SummaryStep
  },
  {
    id: 3,
    title: "Work Experience",
    subtitle: "Professional achievements",
    icon: Briefcase,
    component: ExperienceStep
  },
  {
    id: 4,
    title: "Education",
    subtitle: "Academic credentials",
    icon: GraduationCap,
    component: EducationStep
  },
  {
    id: 5,
    title: "Skills & Expertise",
    subtitle: "Technical & soft skills",
    icon: Zap,
    component: SkillsStep
  },
  {
    id: 6,
    title: "Review & Generate",
    subtitle: "Final review & download",
    icon: Eye,
    component: ReviewStep
  }
];

export default function ResumeBuilder() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { navigate } = useSmoothNavigation();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadedMessage, setUploadedMessage] = useState('');
  const [direction, setDirection] = useState(0);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [showParsingResults, setShowParsingResults] = useState(false);
  const [parsingData, setParsingData] = useState<any>(null);
  const [showStartOverConfirm, setShowStartOverConfirm] = useState(false);
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

  // Get resumeId from URL params
  const resumeIdParam = searchParams.get('resumeId');
  const resumeId = resumeIdParam ? parseInt(resumeIdParam) : undefined;

  const { resumeData, setResumeData, saveResume, currentResumeId, isLoading } = useResume({
    userId: user?.id,
    resumeId: resumeId
  });

  useEffect(() => {
    const step = searchParams.get('step');
    if (step) {
      const stepNumber = parseInt(step);
      if (stepNumber >= 1 && stepNumber <= steps.length) {
        setCurrentStep(stepNumber);
      }
    }
  }, [searchParams]);

  // Handle uploaded resume data
  useEffect(() => {
    const uploaded = searchParams.get('uploaded');
    if (uploaded === 'true' && resumeId && user?.id) {
      // Load the uploaded resume data
      loadUploadedResume(resumeId);
    }
  }, [resumeId, searchParams, user?.id]);

  const loadUploadedResume = async (uploadId: number) => {
    try {
      const response = await fetch(`/api/resume/load?resumeId=${uploadId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.resume) {
          setResumeData(data.resume.resume_data);
          if (data.uploadData && data.uploadData.optimization_results) {
            setParsingData(data.uploadData.optimization_results);
            setShowParsingResults(true);
            setUploadedMessage('Resume uploaded and parsed successfully!');
          }
        }
      }
    } catch (error) {
      console.error('Error loading uploaded resume:', error);
    }
  };

  const handleStartOver = () => {
    setResumeData({
      personal: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        portfolio: ''
      },
      summary: {
        currentTitle: '',
        yearsExperience: 0,
        keySkills: [],
        careerObjective: ''
      },
      experience: [],
      education: [],
      skills: []
    });
    setCurrentStep(1);
    setShowStartOverConfirm(false);
    setNotification({
      isVisible: true,
      type: 'info',
      title: 'Started Over',
      message: 'Your resume has been reset. You can now start building from scratch.'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-secondary-300">Loading your resume...</p>
        </div>
      </div>
    );
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (stepNumber: number) => {
    const newDirection = stepNumber > currentStep ? 1 : -1;
    setDirection(newDirection);
    setCurrentStep(stepNumber);
  };

  const handleGenerateResume = async () => {
    setIsGenerating(true);
    
    try {
      // First save the current resume data
      const saveResult = await saveResume();
      if (!saveResult.success) {
        setNotification({
          isVisible: true,
          type: 'error',
          title: 'Save Failed',
          message: 'Failed to save resume before generating. Please try again.'
        });
        return;
      }

      // Generate the document
      const response = await fetch('/api/resume/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeData,
          resumeId: currentResumeId || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate resume');
      }

      // Get the blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resumeData.personal.fullName || 'Resume'}_${new Date().toISOString().split('T')[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error generating resume:', error);
      setNotification({
        isVisible: true,
        type: 'error',
        title: 'Generation Failed',
        message: 'Failed to generate resume. Please try again.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

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

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 text-white">
      {/* Header */}
      <Navigation 
        currentPage="builder" 
        showProgress={true} 
        currentStep={currentStep} 
        totalSteps={steps.length} 
      />

      {/* Success Messages */}
      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50 bg-primary-500 text-white px-6 py-4 rounded-xl shadow-lg"
        >
          <div className="flex items-center space-x-2">
            <span className="text-xl">✅</span>
            <span className="font-semibold">Resume generated successfully!</span>
          </div>
        </motion.div>
      )}

      {uploadedMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50 bg-accent-500 text-white px-6 py-4 rounded-xl shadow-lg"
        >
          <div className="flex items-center space-x-2">
            <span className="text-xl">📄</span>
            <span className="font-semibold">{uploadedMessage}</span>
          </div>
        </motion.div>
      )}

      {/* Parsing Results Display */}
      {showParsingResults && parsingData && (
        <ParsingResultsDisplay
          parsingData={{
            resumeData: resumeData,
            confidence: parsingData.parsingConfidence || parsingData.smartParserConfidence || 0,
            suggestions: parsingData.suggestions || [],
            smartParserConfidence: parsingData.smartParserConfidence,
            parsingConfidence: parsingData.parsingConfidence,
            aiConfidence: parsingData.aiConfidence
          }}
          onAccept={() => setShowParsingResults(false)}
          onEdit={() => setShowParsingResults(false)}
          isVisible={showParsingResults}
          onClose={() => setShowParsingResults(false)}
        />
      )}

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
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
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 mb-8 sm:mb-12">
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
                <step.icon className="w-3 h-3 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
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
                  💡 <strong>Tip:</strong> Make sure your contact information is accurate. This will be used throughout your resume.
                </p>
              </div>
            )}
            {currentStep === 2 && (
              <div className="bg-accent-500/10 border border-accent-500/30 rounded-lg p-2 sm:p-3 max-w-2xl mx-auto">
                <p className="text-accent-300 text-xs sm:text-sm">
                  💡 <strong>Tip:</strong> Write a compelling summary that highlights your key strengths and career goals.
                </p>
              </div>
            )}
            {currentStep === 3 && (
              <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-2 sm:p-3 max-w-2xl mx-auto">
                <p className="text-primary-300 text-xs sm:text-sm">
                  💡 <strong>Tip:</strong> Focus on achievements and quantifiable results rather than just job duties.
                </p>
              </div>
            )}
            {currentStep === 4 && (
              <div className="bg-accent-500/10 border border-accent-500/30 rounded-lg p-2 sm:p-3 max-w-2xl mx-auto">
                <p className="text-accent-300 text-xs sm:text-sm">
                  💡 <strong>Tip:</strong> Include relevant coursework, honors, and academic achievements that relate to your career goals.
                </p>
              </div>
            )}
            {currentStep === 5 && (
              <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-2 sm:p-3 max-w-2xl mx-auto">
                <p className="text-primary-300 text-xs sm:text-sm">
                  💡 <strong>Tip:</strong> Include both technical and soft skills. Be specific and honest about your proficiency levels.
                </p>
              </div>
            )}
            {currentStep === 6 && (
              <div className="bg-accent-500/10 border border-accent-500/30 rounded-lg p-2 sm:p-3 max-w-2xl mx-auto">
                <p className="text-accent-300 text-xs sm:text-sm">
                  🎉 <strong>Almost done!</strong> Review your resume and generate your professional document.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Step Content with Live Preview */}
        <div className="mt-8 sm:mt-12">
          {/* Start Over Button */}
          <div className="flex justify-end mb-6">
            <motion.button
              onClick={() => setShowStartOverConfirm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-secondary-700/50 hover:bg-secondary-600/50 text-secondary-300 hover:text-white rounded-xl transition-all duration-300 border border-secondary-600/50 hover:border-secondary-500/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-4 h-4" />
              <span className="font-medium">Start Over</span>
            </motion.button>
          </div>
          
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
                    <CurrentStepComponent
                      resumeData={resumeData}
                      setResumeData={setResumeData}
                      onNext={nextStep}
                      onPrev={prevStep}
                      canGoNext={currentStep < steps.length}
                      canGoPrev={currentStep > 1}
                      onGenerate={handleGenerateResume}
                      isGenerating={isGenerating}
                      isLastStep={currentStep === steps.length}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Live Preview Section */}
            <div className="hidden lg:block">
              <LivePreview
                resumeData={resumeData}
                onGenerate={handleGenerateResume}
                isGenerating={isGenerating}
                className="sticky top-8"
              />
            </div>
          </div>
        </div>

        {/* Mobile Preview Toggle */}
        <div className="lg:hidden mt-8 sm:mt-12">
          <motion.button
            onClick={() => setShowMobilePreview(!showMobilePreview)}
            className="w-full bg-secondary-800/50 backdrop-blur-sm rounded-xl border border-secondary-700/50 p-3 sm:p-4 text-white hover:bg-secondary-700/50 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center space-x-2">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">
                {showMobilePreview ? 'Hide Preview' : 'Show Resume Preview'}
              </span>
            </div>
          </motion.button>
          
          <AnimatePresence>
            {showMobilePreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <LivePreview
                  resumeData={resumeData}
                  onGenerate={handleGenerateResume}
                  isGenerating={isGenerating}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="bg-secondary-800/30 backdrop-blur-sm rounded-2xl border border-secondary-700/50 p-4 sm:p-6 mt-8 sm:mt-12">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-6 sm:space-y-0">
            <motion.button
              onClick={prevStep}
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
              onClick={nextStep}
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

        {/* Start Over Confirmation Modal */}
        <ConfirmationModal
          isVisible={showStartOverConfirm}
          title="Start Over"
          message="Are you sure you want to start over? All current progress will be lost and cannot be recovered."
          confirmText="Start Over"
          cancelText="Cancel"
          onConfirm={handleStartOver}
          onCancel={() => setShowStartOverConfirm(false)}
          type="warning"
        />

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