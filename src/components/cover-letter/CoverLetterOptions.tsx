'use client';

import React, { useState } from 'react';

interface CoverLetterOptionsProps {
  onSubmit: (options: {
    tone: 'professional' | 'enthusiastic' | 'confident' | 'formal';
    focus: 'experience' | 'skills' | 'achievements' | 'motivation' | 'balanced';
    length: 'brief' | 'standard' | 'detailed';
  }) => void;
  initialData?: {
    tone: 'professional' | 'enthusiastic' | 'confident' | 'formal';
    focus: 'experience' | 'skills' | 'achievements' | 'motivation' | 'balanced';
    length: 'brief' | 'standard' | 'detailed';
  };
}

export default function CoverLetterOptions({ onSubmit, initialData }: CoverLetterOptionsProps) {
  const [options, setOptions] = useState({
    tone: initialData?.tone || 'professional' as const,
    focus: initialData?.focus || 'balanced' as const,
    length: initialData?.length || 'standard' as const
  });

  const handleOptionChange = (field: keyof typeof options, value: any) => {
    setOptions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(options);
  };

  const toneOptions = [
    { value: 'professional', label: 'Professional', description: 'Balanced and business-like' },
    { value: 'enthusiastic', label: 'Enthusiastic', description: 'Energetic and passionate' },
    { value: 'confident', label: 'Confident', description: 'Assured and self-assured' },
    { value: 'formal', label: 'Formal', description: 'Traditional and conservative' }
  ];

  const focusOptions = [
    { value: 'balanced', label: 'Balanced', description: 'Mix of experience, skills, and achievements' },
    { value: 'experience', label: 'Experience', description: 'Emphasize work history and background' },
    { value: 'skills', label: 'Skills', description: 'Highlight technical and soft skills' },
    { value: 'achievements', label: 'Achievements', description: 'Focus on accomplishments and results' },
    { value: 'motivation', label: 'Motivation', description: 'Emphasize interest in the company/role' }
  ];

  const lengthOptions = [
    { value: 'brief', label: 'Brief', description: 'Concise and to the point (~200 words)' },
    { value: 'standard', label: 'Standard', description: 'Traditional length (~300-400 words)' },
    { value: 'detailed', label: 'Detailed', description: 'Comprehensive coverage (~500+ words)' }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Cover Letter Options</h3>
        <p className="text-gray-600">Choose the tone, focus, and length that best fits your application</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Tone Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-4">
            Writing Tone
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {toneOptions.map((option) => (
              <div
                key={option.value}
                className={`relative border rounded-lg p-4 cursor-pointer transition-colors ${
                  options.tone === option.value
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleOptionChange('tone', option.value)}
              >
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="radio"
                      name="tone"
                      value={option.value}
                      checked={options.tone === option.value}
                      onChange={() => handleOptionChange('tone', option.value)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                    />
                  </div>
                  <div className="ml-3">
                    <label className="text-sm font-medium text-gray-900">
                      {option.label}
                    </label>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Focus Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-4">
            Content Focus
          </label>
          <div className="space-y-3">
            {focusOptions.map((option) => (
              <div
                key={option.value}
                className={`relative border rounded-lg p-4 cursor-pointer transition-colors ${
                  options.focus === option.value
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleOptionChange('focus', option.value)}
              >
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="radio"
                      name="focus"
                      value={option.value}
                      checked={options.focus === option.value}
                      onChange={() => handleOptionChange('focus', option.value)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                    />
                  </div>
                  <div className="ml-3">
                    <label className="text-sm font-medium text-gray-900">
                      {option.label}
                    </label>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Length Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-4">
            Cover Letter Length
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {lengthOptions.map((option) => (
              <div
                key={option.value}
                className={`relative border rounded-lg p-4 cursor-pointer transition-colors ${
                  options.length === option.value
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleOptionChange('length', option.value)}
              >
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="radio"
                      name="length"
                      value={option.value}
                      checked={options.length === option.value}
                      onChange={() => handleOptionChange('length', option.value)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                    />
                  </div>
                  <div className="ml-3">
                    <label className="text-sm font-medium text-gray-900">
                      {option.label}
                    </label>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview of Selection */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Your Selection:</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Tone:</span> {toneOptions.find(o => o.value === options.tone)?.label}</p>
            <p><span className="font-medium">Focus:</span> {focusOptions.find(o => o.value === options.focus)?.label}</p>
            <p><span className="font-medium">Length:</span> {lengthOptions.find(o => o.value === options.length)?.label}</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            Continue to Generate
          </button>
        </div>
      </form>
    </div>
  );
}
