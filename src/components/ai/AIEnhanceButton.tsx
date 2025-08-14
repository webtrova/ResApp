'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Wand2, Check, X } from 'lucide-react';
import { useAI } from '@/hooks/useAI';

interface AIEnhanceButtonProps {
  text: string;
  onAccept: (enhancedText: string) => void;
  context?: any;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export default function AIEnhanceButton({
  text,
  onAccept,
  context = {},
  size = 'md',
  disabled = false,
  className = ''
}: AIEnhanceButtonProps) {
  const { enhanceText, isEnhancing } = useAI();
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [enhancedText, setEnhancedText] = useState('');

  const handleEnhance = async () => {
    if (!text || text.trim().length === 0) return;

    const enhanced = await enhanceText(text, context);
    if (enhanced) {
      setEnhancedText(enhanced);
      setShowSuggestion(true);
    }
  };

  const handleAccept = () => {
    onAccept(enhancedText);
    setShowSuggestion(false);
    setEnhancedText('');
  };

  const handleReject = () => {
    setShowSuggestion(false);
    setEnhancedText('');
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  return (
    <div className={`relative ${className}`}>
      {/* Enhance Button */}
      <motion.button
        onClick={handleEnhance}
        disabled={disabled || isEnhancing || !text.trim()}
        className={`
          inline-flex items-center space-x-2 
          bg-gradient-to-r from-purple-500 to-pink-500 
          hover:from-purple-600 hover:to-pink-600 
          text-white rounded-lg font-medium
          transition-all duration-300 
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:scale-105 active:scale-95
          shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40
          ${sizeClasses[size]}
        `}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
      >
        {isEnhancing ? (
          <>
            <Wand2 size={iconSizes[size]} className="animate-spin" />
            <span>Enhancing...</span>
          </>
        ) : (
          <>
            <Sparkles size={iconSizes[size]} />
            <span>AI Enhance</span>
          </>
        )}
      </motion.button>

      {/* Enhancement Suggestion Modal */}
      {showSuggestion && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-full left-0 right-0 mt-3 z-50 min-w-[400px]"
        >
          <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 shadow-2xl">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                AI Enhancement Suggestion
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-400 mb-1 font-medium">Original:</div>
                  <div className="text-sm text-gray-300 bg-gray-700/50 rounded-lg p-3 italic border border-gray-600/50">
                    {text}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1 font-medium">Enhanced:</div>
                  <div className="text-sm text-white bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-4 border border-purple-500/30 shadow-lg">
                    {enhancedText}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={handleAccept}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors duration-300 font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Check size={16} />
                <span>Accept Enhancement</span>
              </motion.button>
              
              <motion.button
                onClick={handleReject}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors duration-300 font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={16} />
                <span>Keep Original</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}