'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ResumeData, Skill } from '@/types/resume';
import { useState } from 'react';
import { Zap, Trash2 } from 'lucide-react';

interface SkillsStepProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData | ((prev: ResumeData) => ResumeData)) => void;
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

const skillCategories = [
  {
    id: 'technical',
    name: 'Technical Skills',
    color: 'from-blue-500 to-cyan-500',
    icon: (
      <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-sm">
        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </div>
    )
  },
  {
    id: 'soft',
    name: 'Soft Skills',
    color: 'from-green-500 to-emerald-500',
    icon: (
      <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-sm">
        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
      </div>
    )
  },
  {
    id: 'other',
    name: 'Other Skills',
    color: 'from-purple-500 to-pink-500',
    icon: (
      <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center shadow-sm">
        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      </div>
    )
  }
];

const suggestionsByCategory = {
  technical: ['JavaScript', 'Python', 'React', 'Node.js', 'HTML/CSS', 'SQL', 'Git', 'AWS', 'Docker', 'TypeScript'],
  soft: ['Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Time Management', 'Adaptability', 'Critical Thinking', 'Creativity'],
  other: ['Microsoft Office', 'Adobe Creative Suite', 'Slack', 'Jira', 'Figma', 'Salesforce', 'Google Analytics', 'Zoom', 'Project Management', 'Customer Service'],
  languages: ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Portuguese', 'Italian', 'Japanese'],
  tools: ['Microsoft Office', 'Adobe Creative Suite', 'Slack', 'Jira', 'Figma', 'Salesforce', 'Google Analytics', 'Zoom']
};

export default function SkillsStep({ 
  resumeData, 
  setResumeData, 
  onNext, 
  canGoNext 
}: SkillsStepProps) {
  
  const [activeCategory, setActiveCategory] = useState('technical');
  const [newSkill, setNewSkill] = useState('');

  const addSkill = (skillName: string, category: string = activeCategory) => {
    if (!skillName.trim()) return;
    
    const skill: Skill = {
      name: skillName.trim(),
      category: category as 'technical' | 'soft' | 'industry',
      level: 'intermediate'
    };
    
    // Check if skill already exists
    const exists = resumeData.skills.some(s => 
      s.name.toLowerCase() === skill.name.toLowerCase()
    );
    
    if (!exists) {
      setResumeData((prev: ResumeData) => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      
      // Also add to keySkills if not already there
      if (!resumeData.summary.keySkills.includes(skill.name)) {
        setResumeData((prev: ResumeData) => ({
          ...prev,
          summary: {
            ...prev.summary,
            keySkills: [...prev.summary.keySkills, skill.name]
          }
        }));
      }
    }
    
    setNewSkill('');
  };

  const removeSkill = (index: number) => {
    const skillToRemove = resumeData.skills[index];
    
    setResumeData((prev: ResumeData) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
      summary: {
        ...prev.summary,
        keySkills: prev.summary.keySkills.filter(s => s !== skillToRemove.name)
      }
    }));
  };

  const updateSkillLevel = (index: number, level: 'beginner' | 'intermediate' | 'advanced' | 'expert') => {
    setResumeData((prev: ResumeData) => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === index ? { ...skill, level } : skill
      )
    }));
  };

  const getSkillsByCategory = (category: string) => {
    return resumeData.skills.filter(skill => skill.category === category);
  };

  const getAvailableSuggestions = (category: string) => {
    const existingSkills = resumeData.skills.map(s => s.name.toLowerCase());
    const categorySuggestions = suggestionsByCategory[category as keyof typeof suggestionsByCategory];
    if (!categorySuggestions) return [];
    return categorySuggestions.filter(suggestion => !existingSkills.includes(suggestion.toLowerCase()));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-3xl"
        >
          <Zap size={32} />
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-2">Showcase your skills & expertise</h3>
        <p className="text-gray-400">Add skills that make you stand out to employers</p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {skillCategories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-300 ${
              activeCategory === category.id
                ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category.icon}
            <span className="font-medium">{category.name}</span>
            <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
              {getSkillsByCategory(category.id).length}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Add New Skill */}
      <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
        <h4 className="text-lg font-semibold text-white mb-4">
          Add {skillCategories.find(c => c.id === activeCategory)?.name}
        </h4>
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSkill(newSkill)}
            className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
            placeholder={`Enter ${skillCategories.find(c => c.id === activeCategory)?.name.toLowerCase()}`}
          />
          <motion.button
            onClick={() => addSkill(newSkill)}
            disabled={!newSkill.trim()}
            className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50"
            whileHover={{ scale: newSkill.trim() ? 1.05 : 1 }}
            whileTap={{ scale: newSkill.trim() ? 0.95 : 1 }}
          >
            Add
          </motion.button>
        </div>

        {/* Suggestions */}
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Popular suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {getAvailableSuggestions(activeCategory).slice(0, 8).map((suggestion) => (
              <motion.button
                key={suggestion}
                onClick={() => addSkill(suggestion)}
                className="px-3 py-1 bg-gray-600/50 text-gray-300 text-sm rounded-full hover:bg-yellow-500/20 hover:text-yellow-300 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Skills List by Category */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          {getSkillsByCategory(activeCategory).length > 0 ? (
            getSkillsByCategory(activeCategory).map((skill, index) => {
              const skillIndex = resumeData.skills.findIndex(s => s.name === skill.name);
              return (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h5 className="font-semibold text-white">{skill.name}</h5>
                      <div className="flex space-x-2 mt-2">
                        {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
                          <button
                            key={level}
                            onClick={() => updateSkillLevel(skillIndex, level as any)}
                            className={`px-3 py-1 text-xs rounded-full transition-all duration-300 ${
                              skill.level === level
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gray-600/50 text-gray-300 hover:bg-gray-500/50'
                            }`}
                          >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => removeSkill(skillIndex)}
                      className="text-red-400 hover:text-red-300 transition-colors ml-4"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-400">
              No {skillCategories.find(c => c.id === activeCategory)?.name.toLowerCase()} added yet.
              <br />
              Add some skills above or click on the suggestions!
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-end mt-8"
      >
        <motion.button
          onClick={onNext}
          disabled={!canGoNext}
          className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 font-semibold shadow-lg disabled:opacity-50"
          whileHover={{ scale: canGoNext ? 1.05 : 1 }}
          whileTap={{ scale: canGoNext ? 0.95 : 1 }}
        >
          Review & Generate →
        </motion.button>
      </motion.div>
    </motion.div>
  );
}