'use client';

import { useState, useEffect } from 'react';

import { useResume } from '@/hooks/useResume';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ResumeData } from '@/types/resume';

export default function ResumeBuilder() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize resume data
  const {
    resumeData,
    setResumeData,
    saveResume,
    currentResumeId
  } = useResume({ userId: user?.id || 0, resumeId: undefined });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleGenerateResume = async () => {
    setIsGenerating(true);
    
    try {
      // First save the current resume data
      const saveResult = await saveResume();
      if (!saveResult.success) {
        alert('Failed to save resume before generating. Please try again.');
        return;
      }

      // Generate the document
      const response = await fetch('/api/resume/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeData,
          resumeId: currentResumeId || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate resume');
      }

      // Get the blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resumeData.personal.fullName || 'Resume'}_${new Date().toISOString().split('T')[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error generating resume:', error);
      alert('Failed to generate resume. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <header className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="Resume Builder Logo" 
                  className="w-full h-full object-cover brightness-0 invert"
                />
              </div>
              <h1 className="text-2xl font-bold text-white">
                Resume Builder
              </h1>
            </div>
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="text-gray-300 hover:text-white transition-all duration-300"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg">
          <div className="flex items-center space-x-2">
            <span className="text-xl">✅</span>
            <span className="font-semibold">Resume generated successfully!</span>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
          <h2 className="text-3xl font-bold text-white mb-8">Resume Builder</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={resumeData.personal.fullName}
                onChange={(e) => setResumeData((prev: ResumeData) => ({
                  ...prev,
                  personal: { ...prev.personal, fullName: e.target.value }
                }))}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={resumeData.personal.email}
                onChange={(e) => setResumeData((prev: ResumeData) => ({
                  ...prev,
                  personal: { ...prev.personal, email: e.target.value }
                }))}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={resumeData.personal.phone}
                onChange={(e) => setResumeData((prev: ResumeData) => ({
                  ...prev,
                  personal: { ...prev.personal, phone: e.target.value }
                }))}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Career Objective
              </label>
              <textarea
                value={resumeData.summary.careerObjective}
                onChange={(e) => setResumeData((prev: ResumeData) => ({
                  ...prev,
                  summary: { ...prev.summary, careerObjective: e.target.value }
                }))}
                rows={4}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400"
                placeholder="Describe your career objective..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Skills (comma-separated)
              </label>
              <textarea
                value={resumeData.summary.keySkills.join(', ')}
                onChange={(e) => {
                  const skills = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                  setResumeData((prev: ResumeData) => ({
                    ...prev,
                    summary: { ...prev.summary, keySkills: skills }
                  }));
                }}
                rows={3}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400"
                placeholder="JavaScript, React, Node.js, Python..."
              />
            </div>

            <div className="pt-6">
              <button 
                onClick={handleGenerateResume}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Generate Resume'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
