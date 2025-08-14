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
      // First try the rule-based enhancer (no API key needed)
      const ruleBasedResponse = await fetch('/api/ai/enhance-rule-based', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, context }),
      });

      if (ruleBasedResponse.ok) {
        const data: AIEnhancementResponse = await ruleBasedResponse.json();
        if (data.success) {
          console.log('Using rule-based enhancement');
          return data.enhanced;
        }
      }

      // If rule-based fails, try the AI API (if available)
      const response = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, context }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('AI Enhancement API Error:', errorData);
        
        // Try fallback enhancement for insufficient balance
        if (response.status === 402) {
          console.log('Trying fallback enhancement...');
          return await tryFallbackEnhancement(text, context);
        } else if (response.status === 401) {
          console.log('AI service not available, using rule-based enhancement');
          // Fall back to rule-based enhancement
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
        } else {
          console.log('AI enhancement failed, using rule-based enhancement');
          // Fall back to rule-based enhancement
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
        }
        return null;
      }

      const data: AIEnhancementResponse = await response.json();

      if (data.success) {
        return data.enhanced;
      } else {
        console.error('AI Enhancement failed:', data);
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