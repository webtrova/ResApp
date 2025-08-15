'use client';

import { useState, useEffect } from 'react';
import { ResumeData } from '@/types/resume';

interface ParsingResultsDisplayProps {
  parsingData: {
    resumeData: ResumeData;
    confidence: number;
    suggestions: string[];
    smartParserConfidence?: number;
    parsingConfidence?: number;
    aiConfidence?: number;
  };
  onAccept: () => void;
  onEdit: () => void;
  isVisible: boolean;
  onClose: () => void;
}

export default function ParsingResultsDisplay({
  parsingData,
  onAccept,
  onEdit,
  isVisible,
  onClose
}: ParsingResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'suggestions'>('overview');

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isVisible) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const { resumeData, confidence, suggestions } = parsingData;

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose}>
      <div className="absolute top-[50vh] left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-secondary-800/95 backdrop-blur-xl rounded-3xl border border-secondary-700/50 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500/20 to-accent-500/20 border-b border-secondary-700/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Resume Parsing Results</h2>
                <p className="text-secondary-400">Review what we extracted from your resume</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-secondary-400 hover:text-white transition-colors duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="p-6 border-b border-secondary-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getConfidenceColor(confidence)}`}>
                  {confidence}%
                </div>
                <div className="text-sm text-secondary-400">Confidence Score</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-white">
                  {getConfidenceLabel(confidence)}
                </div>
                <div className="text-sm text-secondary-400">Quality Rating</div>
              </div>
            </div>
            <div className="w-32 h-2 bg-secondary-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  confidence >= 80 ? 'bg-green-500' : 
                  confidence >= 60 ? 'bg-yellow-500' : 
                  'bg-red-500'
                }`}
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-secondary-700/50">
          {[
            { 
              id: 'overview', 
              label: 'Overview', 
              icon: (
                <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
              )
            },
            { 
              id: 'details', 
              label: 'Details', 
              icon: (
                <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
              )
            },
            { 
              id: 'suggestions', 
              label: 'Suggestions', 
              icon: (
                <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                  </svg>
                </div>
              )
            }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-4 px-6 text-center transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-primary-500/20 text-primary-400 border-b-2 border-primary-500'
                  : 'text-secondary-400 hover:text-white hover:bg-secondary-700/50'
              }`}
            >
              <div className="flex items-center justify-center space-x-3">
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="bg-secondary-700/30 rounded-2xl p-6 border border-secondary-600/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">👤</span>
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    {resumeData.personal.fullName && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        <span className="text-white">{resumeData.personal.fullName}</span>
                      </div>
                    )}
                    {resumeData.personal.email && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                        <span className="text-secondary-300">{resumeData.personal.email}</span>
                      </div>
                    )}
                    {resumeData.personal.phone && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                        <span className="text-secondary-300">{resumeData.personal.phone}</span>
                      </div>
                    )}
                    {!resumeData.personal.fullName && !resumeData.personal.email && (
                      <div className="text-secondary-400 text-sm">No personal information detected</div>
                    )}
                  </div>
                </div>

                {/* Experience */}
                <div className="bg-secondary-700/30 rounded-2xl p-6 border border-secondary-600/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">💼</span>
                    Work Experience
                  </h3>
                  <div className="space-y-3">
                    {resumeData.experience.length > 0 ? (
                      resumeData.experience.slice(0, 3).map((exp, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          <div>
                            <div className="text-white font-medium">{exp.jobTitle}</div>
                            <div className="text-secondary-400 text-sm">{exp.companyName}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-secondary-400 text-sm">No work experience detected</div>
                    )}
                    {resumeData.experience.length > 3 && (
                      <div className="text-secondary-400 text-sm">
                        +{resumeData.experience.length - 3} more positions
                      </div>
                    )}
                  </div>
                </div>

                {/* Education */}
                <div className="bg-secondary-700/30 rounded-2xl p-6 border border-secondary-600/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">🎓</span>
                    Education
                  </h3>
                  <div className="space-y-3">
                    {resumeData.education.length > 0 ? (
                      resumeData.education.map((edu, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                          <div>
                            <div className="text-white font-medium">{edu.degree}</div>
                            <div className="text-secondary-400 text-sm">{edu.institution}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-secondary-400 text-sm">No education detected</div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div className="bg-secondary-700/30 rounded-2xl p-6 border border-secondary-600/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">🛠️</span>
                    Skills
                  </h3>
                  <div className="space-y-3">
                    {resumeData.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.slice(0, 6).map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm border border-primary-500/30"
                          >
                            {skill.name}
                          </span>
                        ))}
                        {resumeData.skills.length > 6 && (
                          <span className="text-secondary-400 text-sm">
                            +{resumeData.skills.length - 6} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-secondary-400 text-sm">No skills detected</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Personal Information Details */}
              <div className="bg-secondary-700/30 rounded-2xl p-6 border border-secondary-600/50">
                <h3 className="text-xl font-semibold text-white mb-4">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-secondary-400 text-sm">Full Name</label>
                    <div className="text-white font-medium">
                      {resumeData.personal.fullName || 'Not detected'}
                    </div>
                  </div>
                  <div>
                    <label className="text-secondary-400 text-sm">Email</label>
                    <div className="text-white font-medium">
                      {resumeData.personal.email || 'Not detected'}
                    </div>
                  </div>
                  <div>
                    <label className="text-secondary-400 text-sm">Phone</label>
                    <div className="text-white font-medium">
                      {resumeData.personal.phone || 'Not detected'}
                    </div>
                  </div>
                  <div>
                    <label className="text-secondary-400 text-sm">Location</label>
                    <div className="text-white font-medium">
                      {resumeData.personal.location || 'Not detected'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Experience Details */}
              <div className="bg-secondary-700/30 rounded-2xl p-6 border border-secondary-600/50">
                <h3 className="text-xl font-semibold text-white mb-4">Work Experience</h3>
                {resumeData.experience.length > 0 ? (
                  <div className="space-y-4">
                    {resumeData.experience.map((exp, index) => (
                      <div key={index} className="border-l-2 border-primary-500 pl-4">
                        <div className="text-white font-semibold">{exp.jobTitle}</div>
                        <div className="text-accent-400">{exp.companyName}</div>
                        <div className="text-secondary-400 text-sm">{exp.startDate}</div>
                        {exp.jobDescription && (
                          <div className="text-secondary-300 mt-2">{exp.jobDescription}</div>
                        )}
                        {exp.achievements.length > 0 && (
                          <div className="mt-2">
                            <div className="text-secondary-400 text-sm font-medium mb-1">Achievements:</div>
                            <ul className="space-y-1">
                              {exp.achievements.map((achievement, idx) => (
                                <li key={idx} className="text-secondary-300 text-sm flex items-start">
                                  <span className="text-primary-400 mr-2">•</span>
                                  {achievement}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-secondary-400">No work experience detected</div>
                )}
              </div>

              {/* Education Details */}
              <div className="bg-secondary-700/30 rounded-2xl p-6 border border-secondary-600/50">
                <h3 className="text-xl font-semibold text-white mb-4">Education</h3>
                {resumeData.education.length > 0 ? (
                  <div className="space-y-4">
                    {resumeData.education.map((edu, index) => (
                      <div key={index} className="border-l-2 border-accent-500 pl-4">
                        <div className="text-white font-semibold">{edu.degree}</div>
                        <div className="text-accent-400">{edu.institution}</div>
                        <div className="text-secondary-400 text-sm">{edu.major}</div>
                        {edu.graduationDate && (
                          <div className="text-secondary-400 text-sm">{edu.graduationDate}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-secondary-400">No education detected</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div className="space-y-6">
              <div className="bg-secondary-700/30 rounded-2xl p-6 border border-secondary-600/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <span className="mr-2">💡</span>
                  Suggestions for Improvement
                </h3>
                {suggestions.length > 0 ? (
                  <div className="space-y-4">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-secondary-600/30 rounded-xl border border-secondary-500/30">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="text-secondary-300">{suggestion}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-secondary-400">No suggestions at this time</div>
                )}
              </div>

              <div className="bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-2xl p-6 border border-primary-500/30">
                <h3 className="text-lg font-semibold text-white mb-3">Next Steps</h3>
                <div className="space-y-3 text-secondary-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <span>Review and edit the extracted information</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <span>Add missing details and achievements</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <span>Use AI enhancement to improve your content</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-secondary-700/30 border-t border-secondary-600/50 p-6">
          <div className="flex items-center justify-between">
            <div className="text-secondary-400 text-sm">
              Confidence: {confidence}% • {resumeData.experience.length} experiences • {resumeData.skills.length} skills
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onEdit}
                className="px-6 py-3 bg-secondary-600 hover:bg-secondary-500 text-white rounded-xl transition-all duration-300 font-medium"
              >
                Edit Information
              </button>
              <button
                onClick={onAccept}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl transition-all duration-300 font-medium shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40"
              >
                Accept & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
