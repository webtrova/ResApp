'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, FileText, Briefcase, GraduationCap, Zap, Eye } from 'lucide-react';

import { useResume } from '@/hooks/useResume';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ResumeData, WorkExperience, Education } from '@/types/resume';

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
    subtitle: "Basic contact details",
    icon: User,
    component: PersonalInfoStep
  },
  {
    id: 2,
    title: "Professional Summary",
    subtitle: "Career objective and skills",
    icon: FileText,
    component: SummaryStep
  },
  {
    id: 3,
    title: "Work Experience",
    subtitle: "Professional background",
    icon: Briefcase,
    component: ExperienceStep
  },
  {
    id: 4,
    title: "Education",
    subtitle: "Academic background",
    icon: GraduationCap,
    component: EducationStep
  },
  {
    id: 5,
    title: "Skills",
    subtitle: "Technical and soft skills",
    icon: Zap,
    component: SkillsStep
  },
  {
    id: 6,
    title: "Review & Generate",
    subtitle: "Final review and download",
    icon: Eye,
    component: ReviewStep
  }
];

export default function ResumeBuilder() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadedMessage, setUploadedMessage] = useState('');
  const [direction, setDirection] = useState(0);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Get resumeId from URL params
  const resumeIdParam = searchParams?.get('resumeId');
  const uploadedParam = searchParams?.get('uploaded');
  const resumeId = resumeIdParam ? parseInt(resumeIdParam) : undefined;

  // Initialize resume data
  const {
    resumeData,
    setResumeData,
    saveResume,
    loadResume,
    currentResumeId,
    isLoading
  } = useResume({ userId: user?.id || 0, resumeId });

  // Redirect if not authenticated but remember this page with params
  useEffect(() => {
    if (!user) {
      const currentUrl = `/builder${resumeId ? `?resumeId=${resumeId}&uploaded=${uploadedParam}` : ''}`;
      localStorage.setItem('redirectAfterLogin', currentUrl);
      router.push('/login');
    }
  }, [user, router, resumeId, uploadedParam]);

  // Show upload success message
  useEffect(() => {
    if (uploadedParam === 'true' && resumeId) {
      setUploadedMessage('Resume uploaded and parsed successfully! You can now edit and enhance it.');
      setTimeout(() => setUploadedMessage(''), 5000);
    }
  }, [uploadedParam, resumeId]);

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
        alert('Failed to save resume before generating. Please try again.');
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
      alert('Failed to generate resume. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 text-white">
      {/* Header */}
      <header className="bg-secondary-800/50 backdrop-blur-xl border-b border-secondary-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="Resume Builder Logo" 
                  className="w-full h-full object-cover brightness-0 invert"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Resume Builder</h1>
                <p className="text-sm text-secondary-400">Step {currentStep} of {steps.length}</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
                              className="text-secondary-300 hover:text-white transition-all duration-300"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

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
          className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-6 py-4 rounded-xl shadow-lg"
        >
          <div className="flex items-center space-x-2">
            <span className="text-xl">📄</span>
            <span className="font-semibold">{uploadedMessage}</span>
          </div>
        </motion.div>
      )}

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <motion.button
                  onClick={() => goToStep(step.id)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300 ${
                    currentStep >= step.id
                                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
              : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <step.icon size={20} />
                </motion.button>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 transition-all duration-300 ${
                    currentStep > step.id ? 'bg-primary-500' : 'bg-secondary-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-secondary-400">
              {steps[currentStep - 1].subtitle}
            </p>
          </div>
        </div>

        {/* Step Content with Live Preview */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="w-full"
              >
                <div className="bg-secondary-800/50 backdrop-blur-sm rounded-2xl border border-secondary-700/50 p-8">
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

        {/* Mobile Preview Toggle */}
        <div className="lg:hidden mt-8">
          <motion.button
            onClick={() => setShowMobilePreview(!showMobilePreview)}
            className="w-full bg-secondary-800/50 backdrop-blur-sm rounded-xl border border-secondary-700/50 p-4 text-white hover:bg-secondary-700/50 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center space-x-2">
              <Eye className="w-5 h-5" />
              <span className="font-medium">
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
        <div className="flex justify-between items-center mt-8">
          <motion.button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-secondary-700 text-white rounded-xl hover:bg-secondary-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: currentStep > 1 ? 1.05 : 1 }}
            whileTap={{ scale: currentStep > 1 ? 0.95 : 1 }}
          >
            ← Previous
          </motion.button>

          <div className="text-center">
            <p className="text-secondary-400 text-sm">
              Step {currentStep} of {steps.length}
            </p>
          </div>

          <motion.button
            onClick={nextStep}
            disabled={currentStep === steps.length}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: currentStep < steps.length ? 1.05 : 1 }}
            whileTap={{ scale: currentStep < steps.length ? 0.95 : 1 }}
          >
            Next →
          </motion.button>
        </div>
      </div>
    </div>
  );
}