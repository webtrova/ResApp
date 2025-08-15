'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/ui/Navigation';

export default function Upload() {
  const { user } = useAuth();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Check if there's a pending file upload from localStorage
  useEffect(() => {
    if (user) {
      const pendingUpload = localStorage.getItem('pendingFileUpload');
      if (pendingUpload) {
        setShowAuthPrompt(false);
        localStorage.removeItem('pendingFileUpload');
        // User just logged in and had a pending upload, show a message
        setError('Please select your file again to upload.');
      }
    }
  }, [user]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError('');

    // If user is not authenticated, show auth prompt
    if (!user) {
      setShowAuthPrompt(true);
      // Store that user was trying to upload a file
      localStorage.setItem('pendingFileUpload', 'true');
      localStorage.setItem('redirectAfterLogin', '/upload');
      return;
    }

    // If user is authenticated, proceed with upload
    handleFileUpload(file);
  };

  const handleFileUpload = async (file: File) => {
    if (!user) return;

    setIsUploading(true);
    setError('');
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id.toString());

      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadSuccess(true);
        // Redirect to builder with the resume ID after a short delay
        setTimeout(() => {
          router.push(`/builder?resumeId=${data.resumeId}&uploaded=true`);
        }, 2000);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAuthPromptLogin = () => {
    router.push('/login');
  };

  const handleAuthPromptSignup = () => {
    router.push('/register');
  };

  // Don't show loading screen anymore - let users interact with upload even without auth

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

      <Navigation currentPage="upload" />

      {/* Main Content */}
      <main className="relative flex items-center justify-center min-h-screen py-12">
        <div className="w-full max-w-2xl px-4">
                      <div className="bg-secondary-800/50 backdrop-blur-xl rounded-3xl border border-secondary-700/50 p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Upload Your Resume</h2>
              <p className="text-secondary-400">Upload your existing resume and let our AI enhance it with professional formatting and improved content.</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            {uploadSuccess && (
              <div className="mb-6 bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-green-400 text-sm">
                Resume uploaded successfully! Redirecting to builder...
              </div>
            )}

            {showAuthPrompt && (
              <div className="mb-6 bg-blue-500/20 border border-blue-500/50 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-2">Authentication Required</h4>
                    <p className="text-blue-200 mb-4">
                      To upload and process your resume, you need to be logged in. This helps us save your progress and keep your data secure.
                    </p>
                    {selectedFile && (
                      <p className="text-blue-300 text-sm mb-4">
                        Selected file: <strong>{selectedFile.name}</strong> - We'll process it after you sign in.
                      </p>
                    )}
                    <div className="flex space-x-3">
                      <button
                        onClick={handleAuthPromptLogin}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 font-medium"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={handleAuthPromptSignup}
                        className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors duration-300 font-medium"
                      >
                        Create Account
                      </button>
                      <button
                        onClick={() => setShowAuthPrompt(false)}
                        className="px-4 py-2 bg-secondary-700 text-secondary-300 rounded-lg hover:bg-secondary-600 transition-colors duration-300 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-600/50 rounded-2xl p-8 text-center hover:border-blue-500/50 transition-colors duration-300">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Drop your resume here</h3>
                <p className="text-gray-400 mb-4">or click to browse files</p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelection}
                  disabled={isUploading}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transform cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Choose File
                    </>
                  )}
                </label>
              </div>

              {/* Supported Formats */}
              <div className="bg-gray-700/30 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-3">Supported Formats</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-300">PDF (.pdf)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-300">Word (.doc, .docx)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-300">Text (.txt)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-300">Max 10MB</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-gray-700/30 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-3">What happens next?</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <span className="text-gray-300">Our AI extracts and analyzes your resume content</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <span className="text-gray-300">We enhance formatting and suggest improvements</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <span className="text-gray-300">You can edit and customize in our builder</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link 
                href="/dashboard"
                className="text-gray-400 hover:text-white transition-colors duration-300 font-medium"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
