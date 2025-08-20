'use client';

import React, { useState } from 'react';
import { EnhancementEngine, EnhancementResult, QuantificationSuggestion } from '@/lib/enhancement/enhancement-engine';

interface EnhancementWidgetProps {
  initialText: string;
  industry?: string;
  roleLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  context?: any;
  onAccept: (enhancedText: string) => void;
  onCancel?: () => void;
}

export const EnhancementWidget: React.FC<EnhancementWidgetProps> = ({
  initialText,
  industry = 'general',
  roleLevel = 'entry',
  context = {},
  onAccept,
  onCancel
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancement, setEnhancement] = useState<EnhancementResult | null>(null);
  const [selectedQuantification, setSelectedQuantification] = useState<string | null>(null);
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEnhance = async () => {
    setIsEnhancing(true);
    setError(null);
    
    try {
      const engine = new EnhancementEngine();
      const result = await engine.enhance({
        originalText: initialText,
        industry,
        roleLevel,
        context
      });
      
      setEnhancement(result);
    } catch (error) {
      console.error('Enhancement failed:', error);
      setError('Enhancement failed. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleQuantificationSelect = (option: string, suggestion: QuantificationSuggestion) => {
    const quantifiedText = suggestion.template
      .replace('{size}', option)
      .replace('{volume}', option)
      .replace('{percentage}', option)
      .replace('{frequency}', option);
    setSelectedQuantification(quantifiedText);
    setSelectedAlternative(null); // Clear alternative selection
  };

  const handleAlternativeSelect = (alternative: string) => {
    setSelectedAlternative(alternative);
    setSelectedQuantification(null); // Clear quantification selection
  };

  const getFinalText = (): string => {
    return selectedQuantification || 
           selectedAlternative || 
           enhancement?.enhancedText || 
           initialText;
  };

  const handleAccept = () => {
    const finalText = getFinalText();
    onAccept(finalText);
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.8) return 'Excellent';
    if (confidence >= 0.6) return 'Good';
    return 'Needs Work';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">✨</span>
            <h3 className="text-lg font-semibold text-white">Harvard Method Enhancement</h3>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-orange-100 hover:text-white transition-colors"
            >
              <span className="text-xl">×</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Original Text */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
            What you wrote:
          </h4>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 text-sm leading-relaxed">
            {initialText}
          </div>
        </div>

        {/* Enhancement Button or Error */}
        {!enhancement && !error && (
          <button
            onClick={handleEnhance}
            disabled={isEnhancing}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isEnhancing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Enhancing with AI...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Enhance with Harvard Method</span>
              </>
            )}
          </button>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-red-500">⚠️</span>
              <span className="text-sm text-red-700">{error}</span>
            </div>
            <button
              onClick={handleEnhance}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Enhanced Result */}
        {enhancement && (
          <div className="space-y-6">
            {/* Main Enhanced Text */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                ✨ Enhanced version:
              </h4>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-gray-800 text-sm leading-relaxed">
                {getFinalText()}
              </div>
            </div>

            {/* Improvement Score */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">💪</span>
                  <span className="text-sm font-medium text-gray-700">Improvement Score:</span>
                  <span className={`text-sm font-semibold ${getConfidenceColor(enhancement.improvements.confidence)}`}>
                    {Math.round(enhancement.improvements.confidence * 100)} points ({getConfidenceLabel(enhancement.improvements.confidence)})
                  </span>
                </div>
                {enhancement.improvements.addedMetrics.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">Added metrics:</span>
                    <span className="text-xs font-medium text-gray-700">
                      {enhancement.improvements.addedMetrics.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantification Options */}
            {enhancement.improvements.quantificationSuggestions.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 flex items-center">
                  <span className="text-blue-500 mr-2">📊</span>
                  Want to add specific numbers?
                </h4>
                {enhancement.improvements.quantificationSuggestions.map((suggestion, index) => (
                  <div key={index} className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <label className="text-xs font-medium text-blue-700">
                      {suggestion.question}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {suggestion.options.map((option, optIndex) => (
                        <button
                          key={optIndex}
                          onClick={() => handleQuantificationSelect(option, suggestion)}
                          className={`p-2 text-sm rounded-md border transition-all ${
                            selectedQuantification?.includes(option)
                              ? 'bg-blue-100 border-blue-300 text-blue-800'
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-200'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Alternative Versions */}
            {enhancement.alternatives.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 flex items-center">
                  <span className="text-purple-500 mr-2">🔄</span>
                  Other versions to consider:
                </h4>
                <div className="space-y-2">
                  {enhancement.alternatives.map((alternative, index) => (
                    <button
                      key={index}
                      onClick={() => handleAlternativeSelect(alternative)}
                      className={`w-full text-left p-3 text-sm rounded-lg border transition-all ${
                        selectedAlternative === alternative
                          ? 'bg-purple-50 border-purple-300 text-purple-800'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-200'
                      }`}
                    >
                      {alternative}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Improvements Summary */}
            {enhancement.improvements.strengthenedWords.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h5 className="text-xs font-medium text-yellow-800 mb-1">✨ Improvements made:</h5>
                <div className="flex flex-wrap gap-1">
                  {enhancement.improvements.strengthenedWords.map((word, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleAccept}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>✓</span>
                <span>Looks Perfect!</span>
              </button>
              <button
                onClick={() => {
                  setEnhancement(null);
                  setSelectedQuantification(null);
                  setSelectedAlternative(null);
                  setError(null);
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <span>🔄</span>
                <span>Try Different</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancementWidget;
