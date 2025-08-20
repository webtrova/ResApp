import { useState } from 'react';

interface AIEnhancementResponse {
  success: boolean;
  original: string;
  enhanced: string;
  context: any;
}

interface AISuggestionResponse {
  success: boolean;
  type: string;
  suggestions: string[] | string;
  context: any;
}

export function useAI() {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  const enhanceText = async (text: string, context: any = {}): Promise<string | null> => {
    setIsEnhancing(true);
    try {
      // Use the new keyword bank enhancement system
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text, 
          industry: context.industry || context.jobTitle?.toLowerCase().includes('plumb') ? 'plumbing' :
                   context.jobTitle?.toLowerCase().includes('hvac') ? 'hvac' :
                   context.jobTitle?.toLowerCase().includes('electric') ? 'electrical' :
                   context.jobTitle?.toLowerCase().includes('tech') || context.jobTitle?.toLowerCase().includes('software') ? 'technology' :
                   context.jobTitle?.toLowerCase().includes('sales') ? 'sales' :
                   context.jobTitle?.toLowerCase().includes('health') || context.jobTitle?.toLowerCase().includes('nurse') ? 'healthcare' :
                   context.jobTitle?.toLowerCase().includes('finance') || context.jobTitle?.toLowerCase().includes('account') ? 'finance' :
                   'general',
          level: context.experienceLevel || context.level || 'entry'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Enhancement API Error:', errorData);
        return null;
      }

      const data = await response.json();

      if (data.success) {
        console.log('Keyword bank enhancement successful');
        return data.enhanced;
      } else {
        console.error('Enhancement failed:', data);
        return null;
      }
    } catch (error) {
      console.error('Error enhancing text:', error);
      // Try rule-based enhancement as final fallback
      try {
        const fallbackResponse = await fetch('/api/ai/enhance-rule-based', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, context }),
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.success) {
            return fallbackData.enhanced;
          }
        }
      } catch (fallbackError) {
        console.error('Rule-based enhancement also failed:', fallbackError);
      }
      return null;
    } finally {
      setIsEnhancing(false);
    }
  };

  const getSuggestions = async (type: 'skills' | 'summary' | 'achievements', context: any = {}): Promise<string[] | string | null> => {
    setIsGeneratingSuggestions(true);
    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, context }),
      });

      const data: AISuggestionResponse = await response.json();

      if (data.success) {
        return data.suggestions;
      } else {
        console.error('AI Suggestions failed:', data);
        return null;
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return null;
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const enhanceJobDescription = async (
    jobTitle: string,
    companyName: string,
    description: string,
    context: any = {}
  ): Promise<string | null> => {
    const enhancementContext = {
      jobTitle,
      companyName,
      ...context
    };

    return enhanceText(description, enhancementContext);
  };

  const generateAchievements = async (
    jobTitle: string,
    companyName: string,
    responsibilities: string,
    context: any = {}
  ): Promise<string[] | null> => {
    const suggestionContext = {
      jobTitle,
      companyName,
      responsibilities,
      ...context
    };

    const suggestions = await getSuggestions('achievements', suggestionContext);
    return Array.isArray(suggestions) ? suggestions : null;
  };

  const generateSkillSuggestions = async (
    jobTitle: string,
    industry: string,
    experienceLevel: string = 'mid-level'
  ): Promise<string[] | null> => {
    const suggestions = await getSuggestions('skills', {
      jobTitle,
      industry,
      experienceLevel
    });
    return Array.isArray(suggestions) ? suggestions : null;
  };

  const generateCareerSummary = async (
    jobTitle: string,
    yearsExperience: number,
    keySkills: string[],
    industry: string = ''
  ): Promise<string | null> => {
    const suggestion = await getSuggestions('summary', {
      jobTitle,
      yearsExperience,
      keySkills,
      industry
    });
    return typeof suggestion === 'string' ? suggestion : null;
  };

  const tryFallbackEnhancement = async (text: string, context: any): Promise<string | null> => {
    try {
      const response = await fetch('/api/ai/enhance-fallback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, context }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('Fallback enhancement successful');
          return data.enhanced;
        }
      }
      return null;
    } catch (error) {
      console.error('Fallback enhancement failed:', error);
      return null;
    }
  };

  return {
    enhanceText,
    getSuggestions,
    enhanceJobDescription,
    generateAchievements,
    generateSkillSuggestions,
    generateCareerSummary,
    isEnhancing,
    isGeneratingSuggestions,
    isLoading: isEnhancing || isGeneratingSuggestions
  };
}