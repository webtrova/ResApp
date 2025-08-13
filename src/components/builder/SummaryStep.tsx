'use client';

import { motion } from 'framer-motion';
import { ResumeData } from '@/types/resume';
import { FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import AIEnhanceButton from '@/components/ai/AIEnhanceButton';
import AISkillsSuggestions from '@/components/ai/AISkillsSuggestions';

interface SummaryStepProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData | ((prev: ResumeData) => ResumeData)) => void;
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

export default function SummaryStep({ 
  resumeData, 
  setResumeData, 
  onNext, 
  canGoNext 
}: SummaryStepProps) {
  
  // Use a separate state for skills text input
  const [skillsInput, setSkillsInput] = useState(resumeData.summary.keySkills.join(', '));
  
  const updateSummary = (field: string, value: any) => {
    setResumeData((prev: ResumeData) => ({
      ...prev,
      summary: { ...prev.summary, [field]: value }
    }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setSkillsInput(text);
    
    // Update skills immediately for better responsiveness
    const skills = text.split(',').map(s => s.trim()).filter(Boolean);
    updateSummary('keySkills', skills);
  };

  const handleSkillsBlur = () => {
    // Clean up formatting when user finishes editing
    const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    const cleanedText = skills.join(', ');
    if (cleanedText !== skillsInput) {
      setSkillsInput(cleanedText);
    }
  };

  const isValid = resumeData.summary.careerObjective.length > 0;

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
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-3xl"
        >
          <FileText size={32} />
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-2">Tell us about your professional goals</h3>
        <p className="text-gray-400">This summary will catch the recruiter's attention</p>
      </div>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Current Title / Target Role
          </label>
          <input
            type="text"
            value={resumeData.summary.currentTitle}
            onChange={(e) => updateSummary('currentTitle', e.target.value)}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            placeholder="e.g., Software Engineer, Marketing Manager, Cook"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Years of Experience
          </label>
          <input
            type="number"
            value={resumeData.summary.yearsExperience}
            onChange={(e) => updateSummary('yearsExperience', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            placeholder="0"
            min="0"
            max="50"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-300">
              Professional Summary / Career Objective *
            </label>
            <AIEnhanceButton
              text={resumeData.summary.careerObjective}
              onAccept={(enhancedText) => updateSummary('careerObjective', enhancedText)}
              context={{
                jobTitle: resumeData.summary.currentTitle,
                yearsExperience: resumeData.summary.yearsExperience,
                keySkills: resumeData.summary.keySkills,
                type: 'summary'
              }}
              size="sm"
              disabled={!resumeData.summary.careerObjective.trim()}
            />
          </div>
          <textarea
            value={resumeData.summary.careerObjective}
            onChange={(e) => updateSummary('careerObjective', e.target.value)}
            rows={5}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            placeholder="Write a compelling summary of your professional background, key achievements, and career goals. For example: 'Experienced software engineer with 5+ years developing scalable web applications. Passionate about creating user-friendly solutions that drive business growth.'"
            required
          />
          <div className="mt-1 text-xs text-gray-400">
            {resumeData.summary.careerObjective.length}/500 characters
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-300">
              Key Skills
            </label>
            <AISkillsSuggestions
              jobTitle={resumeData.summary.currentTitle}
              experienceLevel={resumeData.summary.yearsExperience > 5 ? 'senior' : resumeData.summary.yearsExperience > 2 ? 'mid-level' : 'entry-level'}
              existingSkills={resumeData.summary.keySkills}
              onAddSkills={(skills) => {
                const newSkills = [...resumeData.summary.keySkills, ...skills];
                updateSummary('keySkills', newSkills);
                setSkillsInput(newSkills.join(', '));
              }}
            />
          </div>
          <textarea
            value={skillsInput}
            onChange={handleSkillsChange}
            onBlur={handleSkillsBlur}
            rows={3}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            placeholder="List your top skills separated by commas. For example: JavaScript, React, Node.js, Project Management, Leadership, Customer Service"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {resumeData.summary.keySkills.map((skill, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-500/30"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex justify-end mt-8"
      >
        <motion.button
          onClick={onNext}
          disabled={!isValid || !canGoNext}
          className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
            isValid && canGoNext
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
          whileHover={{ scale: isValid && canGoNext ? 1.05 : 1 }}
          whileTap={{ scale: isValid && canGoNext ? 0.95 : 1 }}
        >
          Continue to Experience →
        </motion.button>
      </motion.div>

      {!isValid && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-red-400 text-sm"
        >
          Please add a professional summary to continue
        </motion.div>
      )}
    </motion.div>
  );
}