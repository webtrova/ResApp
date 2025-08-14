'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ResumeData, WorkExperience } from '@/types/resume';
import { useState } from 'react';
import { Briefcase, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import AIEnhanceButton from '@/components/ai/AIEnhanceButton';

interface ExperienceStepProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData | ((prev: ResumeData) => ResumeData)) => void;
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

export default function ExperienceStep({ 
  resumeData, 
  setResumeData, 
  onNext, 
  canGoNext 
}: ExperienceStepProps) {
  
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const addExperience = () => {
    const newExperience: WorkExperience = {
      companyName: '',
      jobTitle: '',
      startDate: '',
      endDate: '',
      jobDescription: '',
      achievements: ['']
    };
    
    setResumeData((prev: ResumeData) => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
    
    setExpandedIndex(resumeData.experience.length);
  };

  const removeExperience = (index: number) => {
    setResumeData((prev: ResumeData) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
    
    if (expandedIndex === index) {
      setExpandedIndex(null);
    }
  };

  const updateExperience = (index: number, field: string, value: any) => {
    setResumeData((prev: ResumeData) => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addAchievement = (expIndex: number) => {
    const newExperience = [...resumeData.experience];
    newExperience[expIndex].achievements = [...newExperience[expIndex].achievements, ''];
    setResumeData((prev: ResumeData) => ({
      ...prev,
      experience: newExperience
    }));
  };

  const updateAchievement = (expIndex: number, achIndex: number, value: string) => {
    const newExperience = [...resumeData.experience];
    newExperience[expIndex].achievements[achIndex] = value;
    setResumeData((prev: ResumeData) => ({
      ...prev,
      experience: newExperience
    }));
  };

  const removeAchievement = (expIndex: number, achIndex: number) => {
    const newExperience = [...resumeData.experience];
    newExperience[expIndex].achievements = newExperience[expIndex].achievements.filter((_, i) => i !== achIndex);
    setResumeData((prev: ResumeData) => ({
      ...prev,
      experience: newExperience
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-3xl"
        >
          <Briefcase size={32} />
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-2">Share your work experience</h3>
        <p className="text-gray-400">Add your most relevant professional experiences</p>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {resumeData.experience.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30"
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-semibold text-white">
                  {exp.jobTitle || exp.companyName || `Experience ${index + 1}`}
                </h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {expandedIndex === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    onClick={() => removeExperience(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {(expandedIndex === index || !exp.jobTitle) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Job Title *
                        </label>
                        <input
                          type="text"
                          value={exp.jobTitle}
                          onChange={(e) => updateExperience(index, 'jobTitle', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                          placeholder="e.g., Software Engineer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Company *
                        </label>
                        <input
                          type="text"
                          value={exp.companyName}
                          onChange={(e) => updateExperience(index, 'companyName', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                          placeholder="Company Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Start Date
                        </label>
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                          placeholder="MM/YYYY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          End Date
                        </label>
                        <input
                          type="text"
                          value={exp.endDate || ''}
                          onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                          placeholder="MM/YYYY or Present"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-gray-300">
                          Job Description
                        </label>
                        <AIEnhanceButton
                          text={exp.jobDescription}
                          onAccept={(enhancedText) => updateExperience(index, 'jobDescription', enhancedText)}
                          context={{
                            jobTitle: exp.jobTitle,
                            companyName: exp.companyName,
                            type: 'job_description'
                          }}
                          size="sm"
                          disabled={!exp.jobDescription.trim()}
                        />
                      </div>
                      <textarea
                        value={exp.jobDescription}
                        onChange={(e) => updateExperience(index, 'jobDescription', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 resize-none"
                        placeholder="Brief description of your role and responsibilities..."
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-semibold text-gray-300">
                          Key Achievements & Responsibilities
                        </label>
                        <button
                          onClick={() => addAchievement(index)}
                          className="text-green-400 hover:text-green-300 transition-colors text-sm font-medium"
                        >
                          + Add Achievement
                        </button>
                      </div>
                      <div className="space-y-4">
                        {exp.achievements.map((achievement, achIndex) => (
                          <div key={achIndex} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400 font-medium">
                                  Achievement {achIndex + 1}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <AIEnhanceButton
                                    text={achievement}
                                    onAccept={(enhancedText) => updateAchievement(index, achIndex, enhancedText)}
                                    context={{
                                      jobTitle: exp.jobTitle,
                                      companyName: exp.companyName,
                                      type: 'achievement'
                                    }}
                                    size="sm"
                                    disabled={!achievement.trim()}
                                  />
                                  {exp.achievements.length > 1 && (
                                    <button
                                      onClick={() => removeAchievement(index, achIndex)}
                                      className="text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-red-500/10"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <textarea
                                value={achievement}
                                onChange={(e) => updateAchievement(index, achIndex, e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 resize-none"
                                placeholder={`e.g., Increased team productivity by 25% through implementation of new workflow processes`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.button
          onClick={addExperience}
          className="w-full p-4 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:border-green-500 hover:text-green-400 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          + Add Work Experience
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-end mt-8"
      >
        <motion.button
          onClick={onNext}
          disabled={!canGoNext}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-semibold shadow-lg disabled:opacity-50"
          whileHover={{ scale: canGoNext ? 1.05 : 1 }}
          whileTap={{ scale: canGoNext ? 0.95 : 1 }}
        >
          Continue to Education →
        </motion.button>
      </motion.div>
    </motion.div>
  );
}