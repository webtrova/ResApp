'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';

interface EnhancementResult {
  success: boolean;
  original: string;
  enhanced: string;
  improvements: string[];
  suggestions: {
    actionVerbs: string[];
    skills: string[];
    achievements: string[];
    certifications: string[];
  };
  quantificationOptions: Record<string, string[]>;
}

interface EnhancedAIButtonProps {
  text: string;
  onAccept: (enhancedText: string) => void;
  context?: any;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  showDetails?: boolean;
}

export default function EnhancedAIButton({
  text,
  onAccept,
  context = {},
  size = 'md',
  disabled = false,
  className = '',
  showDetails = false
}: EnhancedAIButtonProps) {
  
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [enhancement, setEnhancement] = useState<EnhancementResult | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [selectedQuantification, setSelectedQuantification] = useState<string>('');

  const handleEnhance = async () => {
    if (!text || text.trim().length === 0) return;

    setIsEnhancing(true);
    try {
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text, 
          industry: context.industry || detectIndustry(context.jobTitle || ''),
          level: context.experienceLevel || context.level || 'entry'
        }),
      });

      const data = await response.json();
      if (data.success) {
        setEnhancement(data);
        setSelectedQuantification(data.enhanced);
        setShowSuggestion(true);
      }
    } catch (error) {
      console.error('Enhancement failed:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const detectIndustry = (jobTitle: string): string => {
    const title = jobTitle.toLowerCase();
    if (title.includes('plumb')) return 'plumbing';
    if (title.includes('hvac') || title.includes('heating') || title.includes('cooling')) return 'hvac';
    if (title.includes('electric')) return 'electrical';
    if (title.includes('tech') || title.includes('software') || title.includes('developer')) return 'technology';
    if (title.includes('sales')) return 'sales';
    if (title.includes('health') || title.includes('nurse') || title.includes('medical')) return 'healthcare';
    if (title.includes('finance') || title.includes('account')) return 'finance';
    return 'general';
  };

  const handleQuantificationSelect = (category: string, value: string) => {
    if (!enhancement) return;
    
    const updatedText = enhancement.enhanced.replace(/{X}/g, value);
    setSelectedQuantification(updatedText);
  };

  const handleAccept = () => {
    onAccept(selectedQuantification || enhancement?.enhanced || text);
    setShowSuggestion(false);
    setEnhancement(null);
    setSelectedQuantification('');
  };

  const handleReject = () => {
    setShowSuggestion(false);
    setEnhancement(null);
    setSelectedQuantification('');
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  return (
    <div className={`relative ${className}`}>
      {/* Enhance Button */}
      <button
        onClick={handleEnhance}
        disabled={disabled || isEnhancing || !text.trim()}
        className={`
          ${sizeClasses[size]}
          bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700
          text-white font-medium rounded-lg transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center space-x-2
        `}
      >
        {isEnhancing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Enhancing...</span>
          </>
        ) : (
          <>
            <span>✨</span>
            <span>Enhance</span>
          </>
        )}
      </button>

      {/* Enhancement Results Modal */}
      {showSuggestion && enhancement && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]">
          <div className="bg-secondary-800/95 backdrop-blur-xl rounded-3xl border border-secondary-700/50 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-b border-orange-500/30 px-6 py-4 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">✨ Content Enhancement</h3>
                    <p className="text-orange-200 text-sm">AI-powered improvements for your content</p>
                  </div>
                </div>
                <button
                  onClick={handleReject}
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white/70 hover:text-white transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Before & After */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                    Original Content
                  </h4>
                  <div className="p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-200 text-sm leading-relaxed">
                    {enhancement.original}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-2"></span>
                    Enhanced Version
                  </h4>
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-100 text-sm leading-relaxed">
                    {selectedQuantification}
                  </div>
                </div>
              </div>

              {/* Improvements Made */}
              {enhancement.improvements.length > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-blue-300 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Improvements Made
                  </h4>
                  <ul className="space-y-2">
                    {enhancement.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start text-sm text-blue-200">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quantification Options */}
              {Object.keys(enhancement.quantificationOptions).length > 0 && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-purple-300 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    📊 Customize Numbers
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(enhancement.quantificationOptions).map(([category, values]) => (
                      <div key={category}>
                        <label className="block text-xs font-semibold text-purple-300 mb-2 capitalize">
                          {category}:
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {values.map((value, index) => (
                            <button
                              key={index}
                              onClick={() => handleQuantificationSelect(category, value)}
                              className="text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 px-3 py-1.5 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all duration-200"
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {showDetails && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enhancement.suggestions.actionVerbs.length > 0 && (
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                      <h5 className="text-sm font-semibold text-cyan-300 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        Action Verbs
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {enhancement.suggestions.actionVerbs.slice(0, 6).map((verb, index) => (
                          <span key={index} className="text-xs bg-cyan-500/20 text-cyan-200 px-3 py-1.5 rounded-lg border border-cyan-500/30">
                            {verb}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {enhancement.suggestions.skills.length > 0 && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                      <h5 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                        </svg>
                        Relevant Skills
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {enhancement.suggestions.skills.slice(0, 6).map((skill, index) => (
                          <span key={index} className="text-xs bg-emerald-500/20 text-emerald-200 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-6 border-t border-gray-600/50">
                <button
                  onClick={handleAccept}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Use This Version</span>
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 bg-gray-600/50 hover:bg-gray-600/70 text-gray-200 font-semibold py-3 px-6 rounded-xl transition-all duration-300 border border-gray-500/50 hover:border-gray-500/70 flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Keep Original</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
