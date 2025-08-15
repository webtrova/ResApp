'use client';

import { motion } from 'framer-motion';
import { ResumeData } from '@/types/resume';
import { User } from 'lucide-react';

interface PersonalInfoStepProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData | ((prev: ResumeData) => ResumeData)) => void;
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

export default function PersonalInfoStep({ 
  resumeData, 
  setResumeData, 
  onNext, 
  canGoNext 
}: PersonalInfoStepProps) {
  
  const updatePersonal = (field: string, value: string) => {
    setResumeData((prev: ResumeData) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
    }));
  };

  const isValid = resumeData.personal.fullName && resumeData.personal.email && resumeData.personal.phone;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="text-center mb-6 sm:mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-2xl sm:text-3xl"
        >
          <User size={24} className="sm:w-8 sm:h-8" />
        </motion.div>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Let's start with your basic information</h3>
        <p className="text-gray-400 text-sm sm:text-base">This information will appear at the top of your resume</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={resumeData.personal.fullName}
            onChange={(e) => updatePersonal('fullName', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
            placeholder="John Doe"
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={resumeData.personal.email}
            onChange={(e) => updatePersonal('email', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
            placeholder="john@example.com"
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={resumeData.personal.phone}
            onChange={(e) => updatePersonal('phone', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
            placeholder="(555) 123-4567"
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Location
          </label>
          <input
            type="text"
            value={resumeData.personal.location}
            onChange={(e) => updatePersonal('location', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
            placeholder="City, State"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            LinkedIn Profile
          </label>
          <input
            type="url"
            value={resumeData.personal.linkedin}
            onChange={(e) => updatePersonal('linkedin', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Portfolio/Website
          </label>
          <input
            type="url"
            value={resumeData.personal.portfolio}
            onChange={(e) => updatePersonal('portfolio', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
            placeholder="https://yourportfolio.com"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="flex justify-end mt-8"
      >
        <motion.button
          onClick={onNext}
          disabled={!isValid || !canGoNext}
          className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
            isValid && canGoNext
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
          whileHover={{ scale: isValid && canGoNext ? 1.05 : 1 }}
          whileTap={{ scale: isValid && canGoNext ? 0.95 : 1 }}
        >
          Continue to Summary →
        </motion.button>
      </motion.div>

      {!isValid && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-red-400 text-xs sm:text-sm"
        >
          Please fill in all required fields (marked with *)
        </motion.div>
      )}
    </motion.div>
  );
}