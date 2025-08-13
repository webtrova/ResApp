'use client';

import { motion } from 'framer-motion';
import { ResumeData } from '@/types/resume';
import { Eye, FileDown } from 'lucide-react';

interface ReviewStepProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData | ((prev: ResumeData) => ResumeData)) => void;
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  onGenerate: () => void;
  isGenerating: boolean;
  isLastStep: boolean;
}

export default function ReviewStep({ 
  resumeData, 
  onGenerate,
  isGenerating
}: ReviewStepProps) {

  const completionScore = () => {
    let score = 0;
    let total = 0;

    // Personal info (40 points)
    total += 40;
    if (resumeData.personal.fullName) score += 10;
    if (resumeData.personal.email) score += 10;
    if (resumeData.personal.phone) score += 10;
    if (resumeData.personal.location) score += 5;
    if (resumeData.personal.linkedin) score += 3;
    if (resumeData.personal.portfolio) score += 2;

    // Summary (25 points)
    total += 25;
    if (resumeData.summary.careerObjective) score += 15;
    if (resumeData.summary.currentTitle) score += 5;
    if (resumeData.summary.keySkills.length > 0) score += 5;

    // Experience (20 points)
    total += 20;
    if (resumeData.experience.length > 0) score += 10;
    if (resumeData.experience.some(exp => exp.achievements.some(ach => ach.trim()))) score += 10;

    // Education (10 points)
    total += 10;
    if (resumeData.education.length > 0) score += 10;

    // Skills (5 points)
    total += 5;
    if (resumeData.skills.length > 0) score += 5;

    return Math.round((score / total) * 100);
  };

  const score = completionScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Excellent! Your resume looks complete and professional.';
    if (score >= 60) return 'Good progress! Consider adding more details to improve your resume.';
    return 'Your resume needs more information to be effective.';
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
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-3xl"
        >
          <Eye size={32} />
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-2">Review your resume</h3>
        <p className="text-gray-400">Check everything looks good before generating your professional resume</p>
      </div>

      {/* Completion Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30"
      >
        <div className="text-center">
          <h4 className="text-lg font-semibold text-white mb-4">Resume Completion Score</h4>
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-600"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - score / 100)}`}
                className={`text-transparent bg-gradient-to-r ${getScoreColor(score)} transition-all duration-1000`}
                style={{
                  background: `conic-gradient(from 0deg, #10b981 0%, #059669 ${score}%, #374151 ${score}%, #374151 100%)`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-3xl font-bold bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent`}>
                {score}%
              </span>
            </div>
          </div>
          <p className="text-gray-300">{getScoreMessage(score)}</p>
        </div>
      </motion.div>

      {/* Resume Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white text-black rounded-xl p-8 shadow-2xl"
      >
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {resumeData.personal.fullName || 'Your Name'}
            </h1>
            <div className="text-gray-600 text-sm space-y-1">
              <p>{resumeData.personal.email} | {resumeData.personal.phone}</p>
              {resumeData.personal.location && <p>{resumeData.personal.location}</p>}
              {(resumeData.personal.linkedin || resumeData.personal.portfolio) && (
                <p>
                  {resumeData.personal.linkedin && (
                    <span>{resumeData.personal.linkedin}</span>
                  )}
                  {resumeData.personal.linkedin && resumeData.personal.portfolio && ' | '}
                  {resumeData.personal.portfolio && (
                    <span>{resumeData.personal.portfolio}</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Summary */}
          {resumeData.summary.careerObjective && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1">
                PROFESSIONAL SUMMARY
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed">
                {resumeData.summary.careerObjective}
              </p>
            </div>
          )}

          {/* Experience */}
          {resumeData.experience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
                PROFESSIONAL EXPERIENCE
              </h2>
              {resumeData.experience.map((exp, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-semibold text-gray-800">{exp.jobTitle}</h3>
                      <p className="text-gray-600 text-sm">{exp.companyName}</p>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {exp.startDate} - {exp.endDate || 'Present'}
                    </p>
                  </div>
                  {exp.jobDescription && (
                    <p className="text-gray-700 text-sm mb-2">{exp.jobDescription}</p>
                  )}
                  {exp.achievements.filter(ach => ach.trim()).length > 0 && (
                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                      {exp.achievements.filter(ach => ach.trim()).map((achievement, achIndex) => (
                        <li key={achIndex}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {resumeData.education.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
                EDUCATION
              </h2>
              {resumeData.education.map((edu, index) => (
                <div key={index} className="mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                      <p className="text-gray-600 text-sm">{edu.institution}</p>
                      {edu.major && <p className="text-gray-600 text-sm">{edu.major}</p>}
                    </div>
                    <p className="text-gray-600 text-sm">{edu.graduationDate}</p>
                  </div>
                  {edu.gpa && (
                    <p className="text-gray-600 text-sm">GPA: {edu.gpa}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {resumeData.summary.keySkills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1">
                SKILLS
              </h2>
              <p className="text-gray-700 text-sm">
                {resumeData.summary.keySkills.join(', ')}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center mt-8"
      >
        <motion.button
          onClick={onGenerate}
          disabled={isGenerating}
          className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 font-bold text-lg shadow-2xl disabled:opacity-50"
          whileHover={{ scale: !isGenerating ? 1.05 : 1 }}
          whileTap={{ scale: !isGenerating ? 0.95 : 1 }}
        >
          {isGenerating ? (
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span>Generating Your Resume...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <FileDown size={20} />
              <span>Generate Professional Resume</span>
            </div>
          )}
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-gray-400 text-sm"
      >
        Your resume will be downloaded as a professional Word document
      </motion.div>
    </motion.div>
  );
}