'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Plus, X } from 'lucide-react';
import { useAI } from '@/hooks/useAI';

interface AISkillsSuggestionsProps {
  jobTitle?: string;
  industry?: string;
  experienceLevel?: string;
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

      {/* Skills Suggestions Panel */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <div className="bg-gray-800 border border-gray-600 rounded-xl p-4 shadow-xl min-w-[300px]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
                  <Lightbulb size={16} className="text-blue-400" />
                  <span>AI Skill Suggestions</span>
                </h4>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-3">
                  Select skills to add to your resume:
                </p>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {suggestions.map((skill, index) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all duration-200
                        ${selectedSkills.includes(skill) 
                          ? 'bg-blue-600/30 border border-blue-500/50' 
                          : 'bg-gray-700/50 hover:bg-gray-700 border border-transparent'
                        }
                      `}
                      onClick={() => toggleSkillSelection(skill)}
                    >
                      <div className={`
                        w-4 h-4 rounded border-2 flex items-center justify-center
                        ${selectedSkills.includes(skill) 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-gray-500'
                        }
                      `}>
                        {selectedSkills.includes(skill) && (
                          <Plus size={10} className="text-white rotate-45" />
                        )}
                      </div>
                      <span className="text-sm text-white">{skill}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''} selected
                </span>
                
                <motion.button
                  onClick={handleAddSelectedSkills}
                  disabled={selectedSkills.length === 0}
                  className={`
                    flex items-center space-x-1 px-3 py-2 text-sm rounded-lg font-medium
                    transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                    ${selectedSkills.length > 0
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-700 text-gray-400'
                    }
                  `}
                  whileHover={{ scale: selectedSkills.length > 0 ? 1.05 : 1 }}
                  whileTap={{ scale: selectedSkills.length > 0 ? 0.95 : 1 }}
                >
                  <Plus size={14} />
                  <span>Add Selected</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}