'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ResumeData, Education } from '@/types/resume';
import { useState } from 'react';
import { GraduationCap, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface EducationStepProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData | ((prev: ResumeData) => ResumeData)) => void;
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

export default function EducationStep({ 
  resumeData, 
  setResumeData, 
  onNext, 
  canGoNext 
}: EducationStepProps) {
  
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const addEducation = () => {
    const newEducation: Education = {
      institution: '',
      degree: '',
      major: '',
      graduationDate: '',
      gpa: '',
      achievements: ['']
    };
    
    setResumeData((prev: ResumeData) => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
    
    setExpandedIndex(resumeData.education.length);
  };

  const removeEducation = (index: number) => {
    setResumeData((prev: ResumeData) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
    
    if (expandedIndex === index) {
      setExpandedIndex(null);
    }
  };

  const updateEducation = (index: number, field: string, value: any) => {
    setResumeData((prev: ResumeData) => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addAchievement = (eduIndex: number) => {
    const newEducation = [...resumeData.education];
    newEducation[eduIndex].achievements = [...newEducation[eduIndex].achievements, ''];
    setResumeData((prev: ResumeData) => ({
      ...prev,
      education: newEducation
    }));
  };

  const updateAchievement = (eduIndex: number, achIndex: number, value: string) => {
    const newEducation = [...resumeData.education];
    newEducation[eduIndex].achievements[achIndex] = value;
    setResumeData((prev: ResumeData) => ({
      ...prev,
      education: newEducation
    }));
  };

  const removeAchievement = (eduIndex: number, achIndex: number) => {
    const newEducation = [...resumeData.education];
    newEducation[eduIndex].achievements = newEducation[eduIndex].achievements.filter((_, i) => i !== achIndex);
    setResumeData((prev: ResumeData) => ({
      ...prev,
      education: newEducation
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
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-3xl"
        >
          <GraduationCap size={32} />
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-2">Education & Academic Background</h3>
        <p className="text-gray-400">Add your educational qualifications and achievements</p>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {resumeData.education.map((edu, index) => (
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
                  {edu.degree || edu.institution || `Education ${index + 1}`}
                </h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {expandedIndex === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    onClick={() => removeEducation(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {(expandedIndex === index || !edu.degree) && (
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
                          Degree *
                        </label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                          placeholder="e.g., Bachelor of Science, Associate Degree"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Institution *
                        </label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                          placeholder="University/College Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Major/Field of Study
                        </label>
                        <input
                          type="text"
                          value={edu.major}
                          onChange={(e) => updateEducation(index, 'major', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                          placeholder="e.g., Computer Science, Business Administration"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Graduation Date
                        </label>
                        <input
                          type="text"
                          value={edu.graduationDate}
                          onChange={(e) => updateEducation(index, 'graduationDate', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                          placeholder="MM/YYYY or Expected MM/YYYY"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          GPA (Optional)
                        </label>
                        <input
                          type="text"
                          value={edu.gpa || ''}
                          onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                          placeholder="3.8/4.0 (only if 3.5+)"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-semibold text-gray-300">
                          Academic Achievements & Activities
                        </label>
                        <button
                          onClick={() => addAchievement(index)}
                          className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
                        >
                          + Add Achievement
                        </button>
                      </div>
                      <div className="space-y-2">
                        {edu.achievements.map((achievement, achIndex) => (
                          <div key={achIndex} className="flex space-x-2">
                            <textarea
                              value={achievement}
                              onChange={(e) => updateAchievement(index, achIndex, e.target.value)}
                              rows={2}
                              className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                              placeholder={`Achievement ${achIndex + 1}: e.g., Dean's List, Summa Cum Laude, President of Student Council`}
                            />
                            {edu.achievements.length > 1 && (
                              <button
                                onClick={() => removeAchievement(index, achIndex)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
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
          onClick={addEducation}
          className="w-full p-4 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:border-indigo-500 hover:text-indigo-400 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          + Add Education
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
          className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 font-semibold shadow-lg disabled:opacity-50"
          whileHover={{ scale: canGoNext ? 1.05 : 1 }}
          whileTap={{ scale: canGoNext ? 0.95 : 1 }}
        >
          Continue to Skills →
        </motion.button>
      </motion.div>
    </motion.div>
  );
}