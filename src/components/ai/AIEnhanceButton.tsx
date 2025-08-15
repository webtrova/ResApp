'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Wand2, Check, X } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import ModalPortal from '@/components/ui/ModalPortal';

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
  
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [enhancedText, setEnhancedText] = useState('');
  const { enhanceText, isEnhancing } = useAI();

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

      {/* Enhancement Suggestion Modal using Portal */}
      <ModalPortal isOpen={showSuggestion} onClose={handleReject}>
        <div className="p-8">
          {/* Enhanced Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">AI Enhancement</h4>
                  <p className="text-sm text-gray-400">Professional text improvement</p>
                </div>
              </div>
              <button
                onClick={handleReject}
                className="w-8 h-8 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 hover:scale-105"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Content with Enhanced Styling */}
          <div className="space-y-6">
            {/* Original Text Section */}
            <div className="relative">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Original</span>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-xl p-4 border border-gray-600/30 shadow-inner">
                  <p className="text-gray-300 text-sm leading-relaxed italic">{text}</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/5 to-transparent rounded-xl pointer-events-none"></div>
              </div>
            </div>

            {/* Arrow Indicator */}
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/25 animate-pulse">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>

            {/* Enhanced Text Section */}
            <div className="relative">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-purple-300 uppercase tracking-wide">Enhanced</span>
                <div className="px-2 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full">
                  <span className="text-xs text-purple-300 font-medium">AI Powered</span>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-pink-900/40 backdrop-blur-sm rounded-xl p-5 border border-purple-500/30 shadow-xl shadow-purple-500/10">
                  <p className="text-white text-sm leading-relaxed font-medium">{enhancedText}</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 rounded-xl pointer-events-none"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Action Buttons */}
          <div className="flex items-center space-x-4 mt-8">
            <motion.button
              onClick={handleAccept}
              className="flex-1 flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Check size={14} className="text-white" />
              </div>
              <span>Accept Enhancement</span>
            </motion.button>
            
            <motion.button
              onClick={handleReject}
              className="flex-1 flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg shadow-gray-500/25 hover:shadow-xl hover:shadow-gray-500/40 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <X size={14} className="text-white" />
              </div>
              <span>Keep Original</span>
            </motion.button>
          </div>
        </div>
      </ModalPortal>
    </div>
  );
}