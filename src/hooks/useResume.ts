import { useState, useEffect, useCallback } from 'react';
import { ResumeData } from '@/types/resume';

interface UseResumeProps {
  userId?: number;
  resumeId?: number;
  initialData?: ResumeData;
}

interface UseResumeReturn {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData | ((prev: ResumeData) => ResumeData)) => void;
  updateField: (section: keyof ResumeData, field: string, value: any) => void;
  saveResume: (title?: string) => Promise<{ success: boolean; resumeId?: number; error?: string }>;
  loadResume: (id?: number) => Promise<{ success: boolean; data?: ResumeData; error?: string }>;
  deleteResume: (id: number) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  currentResumeId: number | undefined;
  resetResume: () => void;
}

const initialResumeData: ResumeData = {
  personal: {
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    portfolio: '',
    location: ''
  },
  summary: {
    currentTitle: '',
    yearsExperience: 0,
    keySkills: [],
    careerObjective: ''
  },
  experience: [],
  education: [],
  skills: []
};

export function useResume({ userId, resumeId, initialData }: UseResumeProps): UseResumeReturn {
  const [resumeData, setResumeData] = useState<ResumeData>(initialData || initialResumeData);
  const [originalData, setOriginalData] = useState<ResumeData>(initialData || initialResumeData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [currentResumeId, setCurrentResumeId] = useState<number | undefined>(resumeId);

  // Check for unsaved changes
  const hasUnsavedChanges = JSON.stringify(resumeData) !== JSON.stringify(originalData);

  // Auto-save functionality (debounced)
  useEffect(() => {
    if (!userId || !hasUnsavedChanges) return;

    const timeoutId = setTimeout(async () => {
      if (hasUnsavedChanges) {
        await saveResume();
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [resumeData, userId, hasUnsavedChanges]);

  // Load resume on mount if resumeId is provided
  useEffect(() => {
    if (resumeId && userId) {
      loadResume(resumeId);
    }
  }, [resumeId, userId]);

  const updateField = useCallback((section: keyof ResumeData, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  }, []);

  const saveResume = useCallback(async (title: string = 'My Resume'): Promise<{ success: boolean; resumeId?: number; error?: string }> => {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    setIsSaving(true);
    try {
      const method = currentResumeId ? 'PUT' : 'POST';
      const url = '/api/resume/save';
      const body = currentResumeId 
        ? { resumeId: currentResumeId, resumeData, title }
        : { userId, resumeData, title };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (result.success) {
        if (!currentResumeId && result.resumeId) {
          setCurrentResumeId(result.resumeId);
        }
        setOriginalData(resumeData);
        setLastSaved(new Date());
        return { success: true, resumeId: result.resumeId };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      return { success: false, error: 'Failed to save resume' };
    } finally {
      setIsSaving(false);
    }
  }, [userId, resumeData, currentResumeId]);

  const loadResume = useCallback(async (id?: number): Promise<{ success: boolean; data?: ResumeData; error?: string }> => {
    const targetId = id || currentResumeId;
    if (!targetId) {
      return { success: false, error: 'Resume ID is required' };
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/resume/load?resumeId=${targetId}`);
      const result = await response.json();

      if (result.success) {
        // Handle both single resume and multiple resumes response formats
        const loadedData = result.resume ? result.resume.resume_data : result.resumes.resume_data;
        setResumeData(loadedData);
        setOriginalData(loadedData);
        setCurrentResumeId(targetId);
        return { success: true, data: loadedData };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error loading resume:', error);
      return { success: false, error: 'Failed to load resume' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteResume = useCallback(async (id: number): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/resume/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeId: id })
      });

      const result = await response.json();

      if (result.success) {
        if (id === currentResumeId) {
          setCurrentResumeId(undefined);
          setResumeData(initialResumeData);
          setOriginalData(initialResumeData);
        }
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
      return { success: false, error: 'Failed to delete resume' };
    }
  }, [currentResumeId]);

  const resetResume = useCallback(() => {
    setResumeData(initialResumeData);
    setOriginalData(initialResumeData);
    setCurrentResumeId(undefined);
    setLastSaved(null);
  }, []);

  return {
    resumeData,
    setResumeData,
    updateField,
    saveResume,
    loadResume,
    deleteResume,
    isLoading,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    currentResumeId,
    resetResume
  };
}
