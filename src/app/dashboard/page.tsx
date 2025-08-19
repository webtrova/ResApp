'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/ui/Navigation';
import Notification from '@/components/ui/Notification';

interface Resume {
  id: number;
  title: string;
  resume_data: any;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

interface CoverLetter {
  id: number;
  title: string;
  cover_letter_data: any;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'resumes' | 'coverletters'>('resumes');
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message?: string;
  }>({
    isVisible: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [confirmAction, setConfirmAction] = useState<{
    isVisible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'warning' | 'error';
  } | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      loadUserData();
    }
  }, [user, router]);

  const loadUserData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      await Promise.all([loadResumes(), loadCoverLetters()]);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResumes = async () => {
    if (!user?.id) return;

    try {
      const authToken = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`/api/resume/load?userId=${user.id}`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (data.resumes) {
            setResumes(data.resumes);
          } else if (data.resume) {
            setResumes([data.resume]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
    }
  };

  const loadCoverLetters = async () => {
    if (!user?.id) return;

    try {
      const authToken = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      // We need to create an API endpoint for loading cover letters
      const response = await fetch(`/api/cover-letter/load?userId=${user.id}`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.coverLetters) {
          setCoverLetters(data.coverLetters);
        }
      }
    } catch (error) {
      console.error('Error loading cover letters:', error);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const generateResumeDocument = async (resume: Resume) => {
    try {
      const response = await fetch('/api/resume/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeData: resume.resume_data,
          resumeId: resume.id
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
      a.download = `${resume.resume_data.personal?.fullName || 'Resume'}_${new Date().toISOString().split('T')[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating resume:', error);
      setNotification({
        isVisible: true,
        type: 'error',
        title: 'Generation Failed',
        message: 'Failed to generate resume. Please try again.'
      });
    }
  };

  const viewCoverLetter = (coverLetter: CoverLetter) => {
    // For now, we'll show an alert with the content. Later we can create a modal or dedicated page
    const content = coverLetter.cover_letter_data;
    const preview = `
${content.personalInfo?.fullName || 'N/A'}
${content.personalInfo?.email || ''}
${content.personalInfo?.phone || ''}

${new Date().toLocaleDateString()}

${content.jobDetails?.contactPerson || 'Hiring Manager'}
${content.jobDetails?.companyName || 'Company'}

Dear ${content.jobDetails?.contactPerson || 'Hiring Manager'},

${content.opening || ''}

${content.body?.map((p: any) => p.content).join('\n\n') || ''}

${content.closing || ''}

${content.signature || ''}
    `;
    
    // Create a simple modal-like experience
    const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>${coverLetter.title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; max-width: 800px; margin: 0 auto; }
              .header { margin-bottom: 30px; }
              .content { white-space: pre-line; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${coverLetter.title}</h1>
              <p><strong>Company:</strong> ${content.jobDetails?.companyName || 'N/A'}</p>
              <p><strong>Position:</strong> ${content.jobDetails?.jobTitle || 'N/A'}</p>
            </div>
            <div class="content">${preview}</div>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const deleteCoverLetter = async (coverLetterId: number) => {
    setConfirmAction({
      isVisible: true,
      title: 'Delete Cover Letter',
      message: 'Are you sure you want to delete this cover letter? This action cannot be undone.',
      type: 'warning',
      onConfirm: () => performCoverLetterDeletion(coverLetterId)
    });
  };

  const performCoverLetterDeletion = async (coverLetterId: number) => {
    setConfirmAction(null);
    
    try {
      const authToken = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch('/api/cover-letter/delete', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ coverLetterId })
      });

      if (response.ok) {
        // Refresh cover letters
        await loadCoverLetters();
        setNotification({
          isVisible: true,
          type: 'success',
          title: 'Cover Letter Deleted',
          message: 'The cover letter has been successfully removed.'
        });
      } else {
        throw new Error('Failed to delete cover letter');
      }
    } catch (error) {
      console.error('Error deleting cover letter:', error);
      setNotification({
        isVisible: true,
        type: 'error',
        title: 'Deletion Failed',
        message: 'Failed to delete cover letter. Please try again.'
      });
    }
  };

  const deleteResume = async (resumeId: number) => {
    setConfirmAction({
      isVisible: true,
      title: 'Delete Resume',
      message: 'Are you sure you want to delete this resume? This action cannot be undone.',
      type: 'warning',
      onConfirm: () => performResumeDeletion(resumeId)
    });
  };

  const performResumeDeletion = async (resumeId: number) => {
    setConfirmAction(null);
    
    try {
      const authToken = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch('/api/resume/delete', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ resumeId })
      });

      if (response.ok) {
        // Refresh resumes
        await loadResumes();
        setNotification({
          isVisible: true,
          type: 'warning',
          title: 'Resume Deleted',
          message: 'The resume has been permanently removed from your account.'
        });
      } else {
        throw new Error('Failed to delete resume');
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
      setNotification({
        isVisible: true,
        type: 'error',
        title: 'Deletion Failed',
        message: 'Failed to delete resume. Please try again.'
      });
    }
  };

  // Show loading while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-primary-400/20 to-accent-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            left: `${mousePosition.x * 0.1}px`,
            top: `${mousePosition.y * 0.1}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-primary-400/20 to-accent-500/20 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-accent-400/20 to-primary-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      </div>

      {/* Header */}
      <Navigation currentPage="dashboard" />

      {/* Main Content */}
      <main className="relative flex items-center justify-center min-h-screen py-12">
        <div className="w-full max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Choose Your Path
            </h2>
            <p className="text-xl text-secondary-400 max-w-2xl mx-auto">
              Upload an existing resume to enhance it, or start building a new one from scratch with our AI-powered builder.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Upload Resume Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-500/20 to-primary-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <Link 
                href="/upload"
                className="relative block bg-secondary-800/50 backdrop-blur-xl rounded-3xl border border-secondary-700/50 p-8 shadow-2xl hover:shadow-accent-500/25 transition-all duration-500 hover:scale-105 group"
              >
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-accent-500 to-primary-500 flex items-center justify-center shadow-lg shadow-accent-500/25 group-hover:shadow-xl group-hover:shadow-accent-500/40 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
                    <svg className="w-11 h-11 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 6v3h3" />
                      <circle cx="12" cy="16" r="1" fill="currentColor" opacity="0.6" />
                      <circle cx="9" cy="12" r="0.5" fill="currentColor" opacity="0.4" />
                      <circle cx="15" cy="12" r="0.5" fill="currentColor" opacity="0.4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Upload Resume</h3>
                  <p className="text-secondary-400 mb-6 leading-relaxed">
                    Upload your existing resume and let our AI enhance it with professional formatting, 
                    improved content, and optimized structure.
                  </p>
                  <div className="inline-flex items-center text-accent-400 group-hover:text-accent-300 transition-colors duration-300">
                    <span className="font-medium">Get Started</span>
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>

            {/* Build Resume Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <Link 
                href="/builder"
                className="relative block bg-secondary-800/50 backdrop-blur-xl rounded-3xl border border-secondary-700/50 p-8 shadow-2xl hover:shadow-primary-500/25 transition-all duration-500 hover:scale-105 group"
              >
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-xl group-hover:shadow-primary-500/40 transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110">
                    <svg className="w-11 h-11 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 6v3h3" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M6 8l1 1m0 0l1-1m-1 1V4" opacity="0.6" />
                      <rect x="8.5" y="11.5" width="7" height="0.5" rx="0.25" fill="currentColor" opacity="0.7" />
                      <rect x="8.5" y="15.5" width="5" height="0.5" rx="0.25" fill="currentColor" opacity="0.5" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Build Resume</h3>
                  <p className="text-secondary-400 mb-6 leading-relaxed">
                    Create a professional resume from scratch with our step-by-step builder. 
                    Get AI-powered suggestions and real-time previews.
                  </p>
                  <div className="inline-flex items-center text-primary-400 group-hover:text-primary-300 transition-colors duration-300">
                    <span className="font-medium">Start Building</span>
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>

            {/* Cover Letter Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <Link 
                href="/cover-letter-builder"
                className="relative block bg-secondary-800/50 backdrop-blur-xl rounded-3xl border border-secondary-700/50 p-8 shadow-2xl hover:shadow-green-500/25 transition-all duration-500 hover:scale-105 group"
              >
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25 group-hover:shadow-xl group-hover:shadow-green-500/40 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110">
                    <svg className="w-11 h-11 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 11l4 2 4-2" opacity="0.6" />
                      <circle cx="7" cy="9" r="0.8" fill="currentColor" opacity="0.8" />
                      <circle cx="17" cy="9" r="0.8" fill="currentColor" opacity="0.8" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M9 15h6" opacity="0.5" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Cover Letters</h3>
                  <p className="text-secondary-400 mb-6 leading-relaxed">
                    Generate professional cover letters tailored to specific job postings using your resume data and AI-powered content creation.
                  </p>
                  <div className="inline-flex items-center text-green-400 group-hover:text-green-300 transition-colors duration-300">
                    <span className="font-medium">Create Cover Letter</span>
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Saved Documents Section */}
          <div className="mt-16 max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Your Saved Documents</h3>
              <p className="text-secondary-400">Manage your resumes and cover letters</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
              <div className="bg-secondary-800/50 backdrop-blur-xl rounded-2xl border border-secondary-700/50 p-2">
                <button
                  onClick={() => setActiveTab('resumes')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === 'resumes'
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                      : 'text-secondary-400 hover:text-white hover:bg-secondary-700/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Resumes ({resumes.length})
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('coverletters')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === 'coverletters'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                      : 'text-secondary-400 hover:text-white hover:bg-secondary-700/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Cover Letters ({coverLetters.length})
                  </span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="bg-secondary-800/30 backdrop-blur-xl rounded-2xl border border-secondary-700/50 p-6 min-h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {activeTab === 'resumes' ? (
                      resumes.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                          {resumes.map((resume) => (
                            <motion.div
                              key={resume.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="group relative bg-secondary-800/50 backdrop-blur-xl rounded-xl border border-secondary-700/50 p-6 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300 hover:scale-105"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-xl group-hover:shadow-primary-500/30 transition-all duration-300 group-hover:scale-110">
                                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 6v3h3" />
                                    <rect x="9" y="8" width="4" height="0.5" rx="0.25" fill="currentColor" opacity="0.6" />
                                    <rect x="9" y="11.5" width="6" height="0.5" rx="0.25" fill="currentColor" opacity="0.7" />
                                    <rect x="9" y="15.5" width="5" height="0.5" rx="0.25" fill="currentColor" opacity="0.5" />
                                  </svg>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  resume.is_complete 
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                }`}>
                                  {resume.is_complete ? 'Complete' : 'Draft'}
                                </span>
                              </div>
                              <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                                {resume.title}
                              </h4>
                              <p className="text-secondary-400 text-sm mb-4">
                                {resume.resume_data?.personal?.fullName || 'Unnamed Resume'}
                              </p>
                              <p className="text-secondary-500 text-xs mb-4">
                                Updated: {new Date(resume.updated_at).toLocaleDateString()}
                              </p>
                              <div className="flex gap-2">
                                <Link
                                  href={`/builder?resumeId=${resume.id}`}
                                  className="flex-1 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 text-center border border-primary-500/30 hover:scale-105 group/edit"
                                >
                                  <span className="flex items-center justify-center gap-1.5">
                                    <svg className="w-4 h-4 group-hover/edit:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit
                                  </span>
                                </Link>
                                <button
                                  onClick={() => generateResumeDocument(resume)}
                                  className="flex-1 bg-secondary-700/50 hover:bg-secondary-600/50 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-secondary-600/50 hover:scale-105 group/download"
                                >
                                  <span className="flex items-center justify-center gap-1.5">
                                    <svg className="w-4 h-4 group-hover/download:translate-y-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download
                                  </span>
                                </button>
                                <button
                                  onClick={() => deleteResume(resume.id)}
                                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-red-500/30 hover:scale-105 group/delete"
                                >
                                  <span className="flex items-center justify-center gap-1.5">
                                    <svg className="w-4 h-4 group-hover/delete:rotate-12 group-hover/delete:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                  </span>
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-secondary-400 py-16">
                          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-primary-500/20 to-primary-600/20 flex items-center justify-center">
                            <svg className="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 6v3h3" />
                              <rect x="9" y="8" width="4" height="0.5" rx="0.25" fill="currentColor" opacity="0.4" />
                              <rect x="9" y="11.5" width="6" height="0.5" rx="0.25" fill="currentColor" opacity="0.4" />
                              <rect x="9" y="15.5" width="5" height="0.5" rx="0.25" fill="currentColor" opacity="0.3" />
                            </svg>
                          </div>
                          <p className="text-lg mb-2">No resumes yet</p>
                          <p className="text-sm">Create your first resume to get started!</p>
                          <Link
                            href="/builder"
                            className="inline-block mt-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 font-medium"
                          >
                            Create Resume
                          </Link>
                        </div>
                      )
                    ) : (
                      coverLetters.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                          {coverLetters.map((coverLetter) => (
                            <motion.div
                              key={coverLetter.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="group relative bg-secondary-800/50 backdrop-blur-xl rounded-xl border border-secondary-700/50 p-6 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 hover:scale-105"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/25 group-hover:shadow-xl group-hover:shadow-green-500/30 transition-all duration-300 group-hover:scale-110">
                                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8 11l4 2 4-2" opacity="0.7" />
                                    <circle cx="7" cy="9" r="1" fill="currentColor" opacity="0.8" />
                                    <circle cx="17" cy="9" r="1" fill="currentColor" opacity="0.8" />
                                    <rect x="8" y="14.5" width="8" height="0.8" rx="0.4" fill="currentColor" opacity="0.5" />
                                    <circle cx="12" cy="12" r="0.8" fill="currentColor" opacity="0.9" />
                                  </svg>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  coverLetter.is_complete 
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                }`}>
                                  {coverLetter.is_complete ? 'Complete' : 'Draft'}
                                </span>
                              </div>
                              <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                                {coverLetter.title}
                              </h4>
                              <p className="text-secondary-400 text-sm mb-4">
                                {coverLetter.cover_letter_data?.jobDetails?.companyName && coverLetter.cover_letter_data?.jobDetails?.jobTitle
                                  ? `${coverLetter.cover_letter_data.jobDetails.jobTitle} at ${coverLetter.cover_letter_data.jobDetails.companyName}`
                                  : 'Cover Letter'
                                }
                              </p>
                              <p className="text-secondary-500 text-xs mb-4">
                                Updated: {new Date(coverLetter.updated_at).toLocaleDateString()}
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => viewCoverLetter(coverLetter)}
                                  className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 text-center border border-green-500/30 hover:scale-105 group/view"
                                >
                                  <span className="flex items-center justify-center gap-1.5">
                                    <svg className="w-4 h-4 group-hover/view:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    View
                                  </span>
                                </button>
                                <button
                                  onClick={() => deleteCoverLetter(coverLetter.id)}
                                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-red-500/30 hover:scale-105 group/delete"
                                >
                                  <span className="flex items-center justify-center gap-1.5">
                                    <svg className="w-4 h-4 group-hover/delete:rotate-12 group-hover/delete:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                  </span>
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-secondary-400 py-16">
                          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                            <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8 11l4 2 4-2" opacity="0.6" />
                              <circle cx="7" cy="9" r="0.8" fill="currentColor" opacity="0.6" />
                              <circle cx="17" cy="9" r="0.8" fill="currentColor" opacity="0.6" />
                              <rect x="8" y="14.5" width="8" height="0.8" rx="0.4" fill="currentColor" opacity="0.4" />
                            </svg>
                          </div>
                          <p className="text-lg mb-2">No cover letters yet</p>
                          <p className="text-sm">Create your first cover letter!</p>
                          <Link
                            href="/cover-letter-builder"
                            className="inline-block mt-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium"
                          >
                            Create Cover Letter
                          </Link>
                        </div>
                      )
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Notification */}
      <Notification
        isVisible={notification.isVisible}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999]" onClick={() => setConfirmAction(null)}>
            <div className="min-h-screen flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-secondary-800/95 backdrop-blur-xl rounded-3xl border border-secondary-700/50 shadow-2xl max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className={`bg-gradient-to-r ${
                  confirmAction.type === 'warning' 
                    ? 'from-yellow-500/20 to-orange-600/20 border-yellow-500/30' 
                    : 'from-red-500/20 to-pink-600/20 border-red-500/30'
                } border-b p-6 rounded-t-3xl`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${
                      confirmAction.type === 'warning'
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-yellow-500/25'
                        : 'bg-gradient-to-br from-red-400 to-pink-500 shadow-red-500/25'
                    } rounded-2xl flex items-center justify-center shadow-lg`}>
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white">{confirmAction.title}</h2>
                      <p className="text-secondary-300 text-sm">Confirmation Required</p>
                    </div>
                    <button
                      onClick={() => setConfirmAction(null)}
                      className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white/70 hover:text-white transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-secondary-300 leading-relaxed mb-6">{confirmAction.message}</p>
                  
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setConfirmAction(null)}
                      className="px-6 py-3 bg-secondary-700/50 hover:bg-secondary-600/50 text-secondary-300 hover:text-white rounded-xl transition-all duration-300 font-medium border border-secondary-600/50 hover:border-secondary-500/50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        confirmAction.onConfirm();
                      }}
                      className={`px-6 py-3 ${
                        confirmAction.type === 'warning'
                          ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 hover:text-yellow-300 border-yellow-500/30'
                          : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border-red-500/30'
                      } rounded-xl transition-all duration-300 font-medium border hover:scale-105`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
