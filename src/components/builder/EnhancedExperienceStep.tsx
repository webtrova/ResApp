'use client';

import React, { useState } from 'react';
import { EnhancementWidget } from '@/components/ai/EnhancementWidget';

interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  enhancedDescription?: string;
  isCurrentPosition?: boolean;
}

interface EnhancedExperienceStepProps {
  experiences: WorkExperience[];
  onUpdate: (experiences: WorkExperience[]) => void;
  industry?: string;
  targetPosition?: string;
}

export const EnhancedExperienceStep: React.FC<EnhancedExperienceStepProps> = ({
  experiences,
  onUpdate,
  industry = 'general',
  targetPosition
}) => {
  const [enhancingIndex, setEnhancingIndex] = useState<number | null>(null);

  const updateExperience = (index: number, field: keyof WorkExperience, value: any) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate(updated);
  };

  const addExperience = () => {
    const newExperience: WorkExperience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      isCurrentPosition: false
    };
    onUpdate([...experiences, newExperience]);
  };

  const removeExperience = (index: number) => {
    const updated = experiences.filter((_, i) => i !== index);
    onUpdate(updated);
  };

  const handleEnhancementAccept = (index: number, enhancedText: string) => {
    updateExperience(index, 'enhancedDescription', enhancedText);
    setEnhancingIndex(null);
  };

  const getRoleLevel = (position: string): 'entry' | 'mid' | 'senior' | 'executive' => {
    const positionLower = position.toLowerCase();
    if (positionLower.includes('director') || positionLower.includes('vp') || positionLower.includes('ceo') || positionLower.includes('executive')) {
      return 'executive';
    }
    if (positionLower.includes('senior') || positionLower.includes('lead') || positionLower.includes('principal')) {
      return 'senior';
    }
    if (positionLower.includes('manager') || positionLower.includes('coordinator') || positionLower.includes('specialist')) {
      return 'mid';
    }
    return 'entry';
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Work Experience</h2>
        <p className="text-gray-600">
          Describe your work experience. Our AI will help transform your descriptions into professional, Harvard-methodology compliant content.
        </p>
      </div>

      {experiences.map((experience, index) => (
        <div key={experience.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* Experience Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Experience #{index + 1}
              </h3>
              {experiences.length > 1 && (
                <button
                  onClick={() => removeExperience(index)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Company Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Microsoft, Amazon, Local Restaurant"
                  value={experience.company}
                  onChange={(e) => updateExperience(index, 'company', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Job Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Software Developer, Sales Associate"
                  value={experience.position}
                  onChange={(e) => updateExperience(index, 'position', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="month"
                  value={experience.startDate}
                  onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="month"
                  value={experience.endDate}
                  onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                  disabled={experience.isCurrentPosition}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  &nbsp;
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`current-${index}`}
                    checked={experience.isCurrentPosition || false}
                    onChange={(e) => {
                      updateExperience(index, 'isCurrentPosition', e.target.checked);
                      if (e.target.checked) {
                        updateExperience(index, 'endDate', '');
                      }
                    }}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`current-${index}`} className="ml-2 text-sm text-gray-700">
                    Current position
                  </label>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Describe what you did (in your own words):
              </label>
              <textarea
                placeholder="I helped customers, managed inventory, worked with a team, handled complaints, organized files, answered phones..."
                value={experience.description}
                onChange={(e) => updateExperience(index, 'description', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-32 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-vertical"
              />
              <p className="text-xs text-gray-500">
                💡 Tip: Write naturally! Our AI will transform this into professional language with metrics and impact statements.
              </p>
            </div>

            {/* Enhancement Controls */}
            {experience.description && experience.description.trim().length > 10 && (
              <div className="space-y-4">
                {enhancingIndex !== index && !experience.enhancedDescription && (
                  <button
                    onClick={() => setEnhancingIndex(index)}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>✨</span>
                    <span>Enhance with Harvard Method</span>
                  </button>
                )}

                {enhancingIndex === index && (
                  <EnhancementWidget
                    initialText={experience.description}
                    industry={industry}
                    roleLevel={getRoleLevel(experience.position)}
                    context={{
                      position: experience.position,
                      company: experience.company,
                      targetPosition
                    }}
                    onAccept={(enhancedText) => handleEnhancementAccept(index, enhancedText)}
                    onCancel={() => setEnhancingIndex(null)}
                  />
                )}

                {/* Show Enhanced Result */}
                {experience.enhancedDescription && enhancingIndex !== index && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        ✨ Professional version for your resume:
                      </h4>
                      <button
                        onClick={() => setEnhancingIndex(index)}
                        className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                      >
                        Edit Enhancement
                      </button>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-gray-800 text-sm leading-relaxed">
                        {experience.enhancedDescription}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Add Experience Button */}
      <div className="text-center">
        <button
          onClick={addExperience}
          className="inline-flex items-center space-x-2 bg-white border-2 border-dashed border-gray-300 rounded-lg px-6 py-4 text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors"
        >
          <span className="text-xl">+</span>
          <span className="font-medium">Add Another Experience</span>
        </button>
      </div>
    </div>
  );
};

export default EnhancedExperienceStep;
