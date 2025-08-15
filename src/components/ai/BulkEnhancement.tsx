'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, Check, X, Zap, Target, TrendingUp } from 'lucide-react';
import { useAI } from '@/hooks/useAI';

interface BulkEnhancementProps {
  items: string[];
  onAccept: (enhancedItems: string[]) => void;
  context?: any;
  title?: string;
  className?: string;
}

interface EnhancementItem {
  original: string;
  enhanced: string;
  status: 'pending' | 'enhancing' | 'enhanced' | 'error';
  error?: string;
}

export default function BulkEnhancement({
  items,
  onAccept,
  context = {},
  title = 'Bulk Enhancement',
  className = ''
}: BulkEnhancementProps) {
  const { enhanceText } = useAI();
  const [enhancementItems, setEnhancementItems] = useState<EnhancementItem[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const startBulkEnhancement = async () => {
    if (items.length === 0) return;

    setIsEnhancing(true);
    setShowResults(false);

    // Initialize enhancement items
    const initialItems: EnhancementItem[] = items.map(item => ({
      original: item,
      enhanced: '',
      status: 'pending'
    }));

    setEnhancementItems(initialItems);

    // Enhance items one by one with progress indication
    const enhancedItems: EnhancementItem[] = [];
    
    for (let i = 0; i < items.length; i++) {
      // Update status to enhancing
      setEnhancementItems(prev => 
        prev.map((item, idx) => 
          idx === i ? { ...item, status: 'enhancing' } : item
        )
      );

      try {
        const enhanced = await enhanceText(items[i], {
          ...context,
          bulkMode: true,
          itemIndex: i,
          totalItems: items.length
        });

        if (enhanced) {
          enhancedItems.push({
            original: items[i],
            enhanced,
            status: 'enhanced'
          });
        } else {
          enhancedItems.push({
            original: items[i],
            enhanced: items[i], // Keep original if enhancement fails
            status: 'error',
            error: 'Enhancement failed'
          });
        }
      } catch (error) {
        enhancedItems.push({
          original: items[i],
          enhanced: items[i],
          status: 'error',
          error: 'Enhancement failed'
        });
      }

      // Update the state with current progress
      setEnhancementItems([...enhancedItems]);
    }

    setIsEnhancing(false);
    setShowResults(true);
  };

  const handleAccept = () => {
    const acceptedItems = enhancementItems
      .filter((_, index) => selectedItems.has(index))
      .map(item => item.enhanced);
    
    onAccept(acceptedItems);
    setShowResults(false);
    setSelectedItems(new Set());
  };

  const handleSelectAll = () => {
    if (selectedItems.size === enhancementItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(enhancementItems.map((_, index) => index)));
    }
  };

  const toggleItemSelection = (index: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const getEnhancementStats = () => {
    const total = enhancementItems.length;
    const enhanced = enhancementItems.filter(item => item.status === 'enhanced').length;
    const errors = enhancementItems.filter(item => item.status === 'error').length;
    
    return { total, enhanced, errors };
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-sm text-secondary-400">
              Enhance {items.length} items with AI-powered Harvard methodology
            </p>
          </div>
        </div>
        
        {!showResults && (
          <motion.button
            onClick={startBulkEnhancement}
            disabled={isEnhancing || items.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-primary-500/25"
            whileHover={{ scale: isEnhancing ? 1 : 1.05 }}
            whileTap={{ scale: isEnhancing ? 1 : 0.95 }}
          >
            {isEnhancing ? (
              <Wand2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{isEnhancing ? 'Enhancing...' : 'Start Enhancement'}</span>
          </motion.button>
        )}
      </div>

      {/* Progress Indicator */}
      {isEnhancing && (
        <div className="bg-secondary-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-secondary-300">Enhancing items...</span>
            <span className="text-sm text-secondary-400">
              {enhancementItems.filter(item => item.status === 'enhanced').length} / {items.length}
            </span>
          </div>
          <div className="w-full bg-secondary-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${(enhancementItems.filter(item => item.status === 'enhanced').length / items.length) * 100}%` 
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Stats */}
            <div className="bg-secondary-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold">Enhancement Results</h4>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Target className="w-4 h-4 text-primary-400" />
                    <span className="text-primary-400">{getEnhancementStats().enhanced} enhanced</span>
                  </div>
                  {getEnhancementStats().errors > 0 && (
                    <div className="flex items-center space-x-1">
                      <X className="w-4 h-4 text-red-400" />
                      <span className="text-red-400">{getEnhancementStats().errors} failed</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-accent-400 hover:text-accent-300 transition-colors"
                >
                  {selectedItems.size === enhancementItems.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-secondary-400 text-sm">
                  ({selectedItems.size} selected)
                </span>
              </div>
            </div>

            {/* Enhancement Items */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {enhancementItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-secondary-800/50 rounded-lg p-4 border transition-all duration-200 ${
                    selectedItems.has(index) 
                      ? 'border-primary-500/50 bg-primary-500/10' 
                      : 'border-secondary-700/50 hover:border-secondary-600/50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(index)}
                      onChange={() => toggleItemSelection(index)}
                      className="mt-1 w-4 h-4 text-primary-500 bg-secondary-700 border-secondary-600 rounded focus:ring-primary-500 focus:ring-2"
                    />
                    
                    <div className="flex-1 space-y-3">
                      {/* Original */}
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs text-secondary-400 font-medium">ORIGINAL</span>
                          {item.status === 'enhancing' && (
                            <Wand2 className="w-3 h-3 text-yellow-400 animate-spin" />
                          )}
                          {item.status === 'enhanced' && (
                            <Check className="w-3 h-3 text-primary-400" />
                          )}
                          {item.status === 'error' && (
                            <X className="w-3 h-3 text-red-400" />
                          )}
                        </div>
                        <p className="text-secondary-300 text-sm italic bg-secondary-700/50 rounded p-2">
                          {item.original}
                        </p>
                      </div>

                      {/* Enhanced */}
                      {item.status === 'enhanced' && (
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs text-secondary-400 font-medium">ENHANCED</span>
                            <TrendingUp className="w-3 h-3 text-primary-400" />
                          </div>
                          <p className="text-white text-sm bg-gradient-to-r from-primary-900/30 to-accent-900/30 rounded p-3 border border-primary-500/30">
                            {item.enhanced}
                          </p>
                        </div>
                      )}

                      {/* Error */}
                      {item.status === 'error' && (
                        <div>
                          <p className="text-red-400 text-sm">
                            {item.error}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowResults(false)}
                className="px-4 py-2 text-secondary-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              
              <motion.button
                onClick={handleAccept}
                disabled={selectedItems.size === 0}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-primary-500/25"
                whileHover={{ scale: selectedItems.size > 0 ? 1.05 : 1 }}
                whileTap={{ scale: selectedItems.size > 0 ? 0.95 : 1 }}
              >
                <Check className="w-4 h-4" />
                <span>Accept Selected ({selectedItems.size})</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
