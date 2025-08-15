'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Plus, X } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import ModalPortal from '@/components/ui/ModalPortal';

interface AISkillsSuggestionsProps {
  jobTitle?: string;
  industry?: string;
  experienceLevel?: 'entry-level' | 'mid-level' | 'senior';
  existingSkills?: string[];
  onAddSkills: (skills: string[]) => void;
  className?: string;
}

export default function AISkillsSuggestions({
  jobTitle = '',
  industry = '',
  experienceLevel = 'mid-level',
  existingSkills = [],
  onAddSkills,
  className = ''
}: AISkillsSuggestionsProps) {
  const { generateSkillSuggestions, isGeneratingSuggestions } = useAI();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const handleGenerateSuggestions = async () => {
    if (!jobTitle) return;

    const skillSuggestions = await generateSkillSuggestions(jobTitle, industry, experienceLevel);
    if (skillSuggestions) {
      // Filter out skills that already exist
      const newSuggestions = skillSuggestions.filter(skill => 
        !existingSkills.some(existing => 
          existing.toLowerCase() === skill.toLowerCase()
        )
      );
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
      setSelectedSkills([]);
    }
  };

  const toggleSkillSelection = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleAddSelectedSkills = () => {
    if (selectedSkills.length > 0) {
      onAddSkills(selectedSkills);
      setShowSuggestions(false);
      setSuggestions([]);
      setSelectedSkills([]);
    }
  };

  const handleClose = () => {
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedSkills([]);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Generate Suggestions Button */}
      <motion.button
        onClick={handleGenerateSuggestions}
        disabled={isGeneratingSuggestions || !jobTitle}
        className={`
          inline-flex items-center space-x-2 
          bg-gradient-to-r from-blue-500 to-cyan-500 
          hover:from-blue-600 hover:to-cyan-600 
          text-white px-3 py-2 rounded-lg text-sm font-medium
          transition-all duration-300 
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:scale-105 active:scale-95
          shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40
        `}
        whileHover={{ scale: !isGeneratingSuggestions && jobTitle ? 1.05 : 1 }}
        whileTap={{ scale: !isGeneratingSuggestions && jobTitle ? 0.95 : 1 }}
      >
        <Lightbulb size={16} className={isGeneratingSuggestions ? 'animate-pulse' : ''} />
        <span>{isGeneratingSuggestions ? 'Generating...' : 'Suggest Skills'}</span>
      </motion.button>

      {/* Skills Suggestions Panel using Portal */}
      <ModalPortal isOpen={showSuggestions && suggestions.length > 0} onClose={handleClose}>
        <div className="p-8">
          {/* Enhanced Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">AI Skill Suggestions</h4>
                  <p className="text-sm text-gray-400">Intelligent skill recommendations</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 hover:scale-105"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Enhanced Content */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-blue-300 uppercase tracking-wide">Recommended Skills</span>
              <div className="px-2 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full">
                <span className="text-xs text-blue-300 font-medium">{suggestions.length} suggestions</span>
              </div>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
              {suggestions.map((skill, index) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer
                    ${selectedSkills.includes(skill) 
                      ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border-blue-500/50 shadow-lg shadow-blue-500/20' 
                      : 'bg-gradient-to-r from-gray-700/50 to-gray-600/50 hover:from-gray-600/50 hover:to-gray-500/50 border-gray-600/30 hover:border-gray-500/50'
                    }
                  `}
                  onClick={() => toggleSkillSelection(skill)}
                >
                  <div className="p-4 flex items-center space-x-3">
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                      ${selectedSkills.includes(skill) 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-400 shadow-lg shadow-blue-500/30' 
                        : 'border-gray-500 group-hover:border-gray-400'
                      }
                    `}>
                      {selectedSkills.includes(skill) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <Plus size={12} className="text-white rotate-45" />
                        </motion.div>
                      )}
                    </div>
                    <span className={`text-sm font-medium transition-colors duration-200 ${
                      selectedSkills.includes(skill) ? 'text-white' : 'text-gray-300 group-hover:text-white'
                    }`}>
                      {skill}
                    </span>
                  </div>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Enhanced Action Section */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl border border-gray-600/30">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-blue-300">{selectedSkills.length}</span>
              </div>
              <span className="text-sm text-gray-400">
                skill{selectedSkills.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            
            <motion.button
              onClick={handleAddSelectedSkills}
              disabled={selectedSkills.length === 0}
              className={`
                flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300
                ${selectedSkills.length > 0
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40'
                  : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                }
              `}
              whileHover={{ scale: selectedSkills.length > 0 ? 1.02 : 1 }}
              whileTap={{ scale: selectedSkills.length > 0 ? 0.98 : 1 }}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${
                selectedSkills.length > 0 ? 'bg-white/20' : 'bg-gray-600'
              }`}>
                <Plus size={14} className={selectedSkills.length > 0 ? 'text-white' : 'text-gray-500'} />
              </div>
              <span>Add Selected</span>
            </motion.button>
          </div>
        </div>
      </ModalPortal>
    </div>
  );
}