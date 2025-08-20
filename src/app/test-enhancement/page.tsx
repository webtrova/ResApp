'use client';

import React, { useState } from 'react';
import { EnhancementWidget } from '@/components/ai/EnhancementWidget';

export default function TestEnhancementPage() {
  const [testText, setTestText] = useState('');
  const [industry, setIndustry] = useState('technology');
  const [roleLevel, setRoleLevel] = useState<'entry' | 'mid' | 'senior' | 'executive'>('entry');
  const [results, setResults] = useState<string[]>([]);

  const sampleTexts = [
    "I helped customers at the store and handled their complaints",
    "I worked on a team project to build a website for clients",
    "I managed inventory and made sure products were organized",
    "I answered phones and scheduled appointments for the office",
    "I wrote code for software applications and fixed bugs"
  ];

  const handleAccept = (enhancedText: string) => {
    setResults(prev => [...prev, enhancedText]);
    setTestText(''); // Clear the input for next test
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ✨ Enhanced Content System Test
          </h1>
          <p className="text-gray-600">
            Test the new Harvard Method enhancement system with interactive quantification and alternatives.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry:
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="technology">Technology</option>
                <option value="retail">Retail</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="education">Education</option>
                <option value="general">General</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Level:
              </label>
              <select
                value={roleLevel}
                onChange={(e) => setRoleLevel(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="executive">Executive</option>
              </select>
            </div>
          </div>

          {/* Input Area */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter text to enhance:
              </label>
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Type a simple job description..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-vertical"
              />
            </div>

            {/* Sample Text Buttons */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Or try these samples:</p>
              <div className="flex flex-wrap gap-2">
                {sampleTexts.map((sample, index) => (
                  <button
                    key={index}
                    onClick={() => setTestText(sample)}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                  >
                    Sample {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhancement Widget */}
        {testText.trim().length > 10 && (
          <div className="mb-8">
            <EnhancementWidget
              initialText={testText}
              industry={industry}
              roleLevel={roleLevel}
              onAccept={handleAccept}
            />
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              🎉 Enhanced Results ({results.length})
            </h2>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <p className="text-gray-800 text-sm leading-relaxed flex-1">
                      {result}
                    </p>
                    <span className="text-xs text-green-600 font-medium ml-4 bg-green-100 px-2 py-1 rounded-full">
                      Result #{index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setResults([])}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear Results
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            🧪 How to Test:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
            <li>Select an industry and role level that matches your test scenario</li>
            <li>Enter simple, everyday language describing work tasks</li>
            <li>Click "Enhance with Harvard Method" to see the AI transformation</li>
            <li>Try the quantification suggestions to add specific numbers</li>
            <li>Explore alternative versions to see different approaches</li>
            <li>Check the improvement score to see how much the text was enhanced</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
