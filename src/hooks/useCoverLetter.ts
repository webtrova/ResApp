import { useState } from 'react';
import { CoverLetterData, JobDetails, ResumeData, CoverLetterGenerationRequest } from '../types/resume';

export const useCoverLetter = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  };

  const generateCoverLetter = async (request: CoverLetterGenerationRequest): Promise<CoverLetterData | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/cover-letter/generate', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate cover letter');
      }

      const data = await response.json();
      return data.coverLetter;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate cover letter';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFromJobPosting = async (
    resumeData: ResumeData,
    jobPosting: string,
    companyName: string,
    jobTitle: string,
    tone: string = 'professional'
  ): Promise<CoverLetterData | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/cover-letter/from-posting', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          resumeData,
          jobPosting,
          companyName,
          jobTitle,
          tone
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate cover letter from job posting');
      }

      const data = await response.json();
      return data.coverLetter;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate cover letter from job posting';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const enhanceContent = async (content: string, context: any = {}): Promise<string | null> => {
    try {
      const response = await fetch('/api/cover-letter/enhance', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content, context }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enhance content');
      }

      const data = await response.json();
      return data.enhancedContent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enhance content';
      setError(errorMessage);
      return null;
    }
  };

  const saveCoverLetter = async (title: string, coverLetterData: CoverLetterData): Promise<boolean> => {
    try {
      const response = await fetch('/api/cover-letter/save', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, coverLetterData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save cover letter');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save cover letter';
      setError(errorMessage);
      return false;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isGenerating,
    error,
    generateCoverLetter,
    generateFromJobPosting,
    enhanceContent,
    saveCoverLetter,
    clearError,
  };
};
