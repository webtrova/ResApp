'use client';

import { motion } from 'framer-motion';
import { Download, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { ResumeData } from '@/types/resume';

interface LivePreviewProps {
  resumeData: ResumeData;
  onGenerate?: () => void;
  isGenerating?: boolean;
  className?: string;
}

export default function LivePreview({ 
  resumeData, 
  onGenerate, 
  isGenerating = false,
  className = '' 
}: LivePreviewProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Present';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  return (
    <div className={`bg-white rounded-xl shadow-2xl overflow-hidden ${className}`}>
      {/* Preview Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Eye className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Live Preview</h3>
          <span className="text-sm text-gray-500">ATS-Optimized Format</span>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
            whileHover={{ scale: isGenerating ? 1 : 1.05 }}
            whileTap={{ scale: isGenerating ? 1 : 0.95 }}
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isGenerating ? 'Generating...' : 'Download'}</span>
          </motion.button>
        </div>
      </div>

      {/* Resume Content */}
      <div className="p-8 text-gray-800">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {resumeData.personal.fullName || 'Your Name'}
          </h1>
          <div className="text-gray-600 space-y-1">
            <p>{resumeData.personal.email || 'email@example.com'}</p>
            <p>{resumeData.personal.phone ? formatPhone(resumeData.personal.phone) : '(555) 123-4567'}</p>
            <p>{resumeData.personal.location || 'City, State'}</p>
            {resumeData.personal.linkedin && (
              <p className="text-blue-600">LinkedIn: {resumeData.personal.linkedin}</p>
            )}
          </div>
        </div>

        {/* Professional Summary */}
        {resumeData.summary.careerObjective && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 border-b-2 border-gray-300 pb-2 mb-3">
              PROFESSIONAL SUMMARY
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {resumeData.summary.careerObjective}
            </p>
          </div>
        )}

        {/* Work Experience */}
        {resumeData.experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 border-b-2 border-gray-300 pb-2 mb-3">
              PROFESSIONAL EXPERIENCE
            </h2>
            <div className="space-y-4">
              {resumeData.experience.map((exp, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {exp.jobTitle}
                    </h3>
                    <span className="text-gray-600 text-sm">
                      {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                    </span>
                  </div>
                  <p className="text-gray-700 font-medium mb-2">
                    {exp.companyName}
                    {exp.location && `, ${exp.location}`}
                  </p>
                  <p className="text-gray-600 mb-3 leading-relaxed">
                    {exp.jobDescription}
                  </p>
                  {exp.achievements.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      {exp.achievements.map((achievement, idx) => (
                        <li key={idx} className="text-gray-700 leading-relaxed">
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {resumeData.education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 border-b-2 border-gray-300 pb-2 mb-3">
              EDUCATION
            </h2>
            <div className="space-y-4">
              {resumeData.education.map((edu, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {edu.degree} in {edu.major}
                    </h3>
                    <span className="text-gray-600 text-sm">
                      {formatDate(edu.graduationDate)}
                    </span>
                  </div>
                  <p className="text-gray-700 font-medium mb-2">
                    {edu.institution}
                  </p>
                  {edu.gpa && edu.gpa >= 3.5 && (
                    <p className="text-gray-600">GPA: {edu.gpa.toFixed(2)}/4.00</p>
                  )}
                  {edu.relevantCoursework && edu.relevantCoursework.length > 0 && (
                    <div className="mt-2">
                      <p className="text-gray-700 font-medium text-sm">Relevant Coursework:</p>
                      <p className="text-gray-600 text-sm">
                        {edu.relevantCoursework.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {resumeData.skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 border-b-2 border-gray-300 pb-2 mb-3">
              TECHNICAL SKILLS
            </h2>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Additional Sections */}
        {resumeData.additional && resumeData.additional.length > 0 && (
          <div className="space-y-6">
            {resumeData.additional.map((section, index) => (
              <div key={index}>
                <h2 className="text-xl font-bold text-gray-900 border-b-2 border-gray-300 pb-2 mb-3">
                  {section.title.toUpperCase()}
                </h2>
                <div className="space-y-3">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-gray-700 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                      {item.date && (
                        <p className="text-gray-600 text-sm">
                          {formatDate(item.date)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
