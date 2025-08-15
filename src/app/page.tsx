'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Notification from '@/components/ui/Notification';
import Navigation from '@/components/ui/Navigation';

export default function Home() {
  const { user, logout } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user ? user.id.toString() : '2'); // Use authenticated user or fallback

      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadSuccess(true);
        // Redirect to builder with the parsed resume data after a short delay
        setTimeout(() => {
          const params = new URLSearchParams({
            resumeId: result.resumeId.toString(),
            uploaded: 'true'
          });
          window.location.href = `/builder?${params.toString()}`;
        }, 1500);
      } else {
        setNotification({
          isVisible: true,
          type: 'error',
          title: 'Upload Failed',
          message: result.error || 'Failed to upload resume'
        });
        setIsUploading(false);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setNotification({
        isVisible: true,
        type: 'error',
        title: 'Upload Failed',
        message: 'Failed to upload resume. Please try again.'
      });
      setIsUploading(false);
    }
  };

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

      {/* Navigation */}
      <Navigation currentPage="home" />

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-secondary-200 to-secondary-400 bg-clip-text text-transparent">
                Transform Simple Language
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary-400 via-primary-500 to-accent-500 bg-clip-text text-transparent animate-pulse">
                into Professional Excellence
              </span>
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-secondary-300 max-w-4xl mx-auto mb-16 leading-relaxed">
            Follow our <span className="text-primary-400 font-semibold">Harvard template guide</span> through 6 intuitive steps. 
            Our AI transforms your everyday descriptions into <span className="text-accent-400 font-semibold">professional excellence</span> 
            with real-time preview as you build.
          </p>
          
          {/* Success Metrics Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
            <div className="group bg-secondary-800/50 backdrop-blur-xl rounded-2xl p-8 border border-secondary-700/50 hover:border-primary-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/10">
              <div className="text-4xl font-bold text-primary-400 mb-3 group-hover:scale-110 transition-transform duration-300">6 Steps</div>
              <div className="text-secondary-400 font-medium">Intuitive Process</div>
              <div className="w-full bg-secondary-700 rounded-full h-1 mt-4">
                <div className="bg-gradient-to-r from-primary-400 to-primary-600 h-1 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
            </div>
            
            <div className="group bg-secondary-800/50 backdrop-blur-xl rounded-2xl p-8 border border-secondary-700/50 hover:border-accent-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-accent-500/10">
              <div className="text-4xl font-bold text-accent-400 mb-3 group-hover:scale-110 transition-transform duration-300">Harvard</div>
              <div className="text-secondary-400 font-medium">Template Guide</div>
              <div className="w-full bg-secondary-700 rounded-full h-1 mt-4">
                <div className="bg-gradient-to-r from-accent-400 to-accent-600 h-1 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
            </div>
            
            <div className="group bg-secondary-800/50 backdrop-blur-xl rounded-2xl p-8 border border-secondary-700/50 hover:border-primary-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/10">
              <div className="text-4xl font-bold text-primary-400 mb-3 group-hover:scale-110 transition-transform duration-300">Live</div>
              <div className="text-secondary-400 font-medium">Real-time Preview</div>
              <div className="flex justify-center mt-4 space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i < 5 ? 'bg-primary-400' : 'bg-secondary-600'}`}></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dual Entry Point Cards */}
        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto mb-20">
          {/* Option A: Upload Existing Resume */}
          <div className="group bg-secondary-800/50 backdrop-blur-xl rounded-3xl border border-secondary-700/50 p-10 hover:border-primary-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-accent-500/25 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">Upload Existing Resume</h3>
              <p className="text-secondary-300 mb-10 text-lg leading-relaxed">
                Upload your current resume and let AI enhance it with Harvard methodology
              </p>
              
              <div className="space-y-8">
                <div className="text-sm text-secondary-400">
                  <div className="font-semibold mb-4 text-white text-lg">Supported formats:</div>
                  <div className="flex justify-center space-x-4">
                    <span className="bg-secondary-700/50 backdrop-blur-sm px-4 py-2 rounded-lg text-white border border-secondary-600/50 hover:border-primary-500/50 transition-colors duration-300">PDF</span>
                    <span className="bg-secondary-700/50 backdrop-blur-sm px-4 py-2 rounded-lg text-white border border-secondary-600/50 hover:border-primary-500/50 transition-colors duration-300">Word</span>
                    <span className="bg-secondary-700/50 backdrop-blur-sm px-4 py-2 rounded-lg text-white border border-secondary-600/50 hover:border-primary-500/50 transition-colors duration-300">Text</span>
                  </div>
                </div>
                
                <label className="block">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <div className={`
                    w-full py-6 px-8 rounded-2xl border-2 border-dashed border-secondary-600/50 
                    hover:border-primary-500 hover:bg-secondary-700/30 transition-all duration-300 cursor-pointer
                    backdrop-blur-sm group-hover:shadow-lg group-hover:shadow-primary-500/20
                    ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}>
                    {isUploading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mr-3"></div>
                        <span className="text-white font-medium">Processing...</span>
                      </div>
                    ) : uploadSuccess ? (
                      <div className="text-center">
                        <div className="text-primary-400 font-semibold text-xl mb-2">✅ Upload Successful!</div>
                        <div className="text-secondary-400">Redirecting to resume builder...</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-primary-400 font-semibold text-xl mb-2">Choose file or drag here</div>
                        <div className="text-secondary-400">AI will extract and optimize your content</div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Option B: Start From Scratch */}
          <div className="group bg-secondary-800/50 backdrop-blur-xl rounded-3xl border border-secondary-700/50 p-10 hover:border-primary-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary-500/25 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">Start From Scratch</h3>
              <p className="text-secondary-300 mb-10 text-lg leading-relaxed">
                Build your resume step by step with AI-powered language enhancement
              </p>
              
              <div className="space-y-8">
                <div className="text-sm text-secondary-400">
                  <div className="font-semibold mb-4 text-white text-lg">AI will help you:</div>
                  <ul className="text-left space-y-3">
                    <li className="flex items-center group/item">
                      <span className="w-3 h-3 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full mr-4 group-hover/item:scale-125 transition-transform duration-300"></span>
                      <span className="group-hover/item:text-white transition-colors duration-300">Transform simple descriptions</span>
                    </li>
                    <li className="flex items-center group/item">
                      <span className="w-3 h-3 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full mr-4 group-hover/item:scale-125 transition-transform duration-300"></span>
                      <span className="group-hover/item:text-white transition-colors duration-300">Add professional metrics</span>
                    </li>
                    <li className="flex items-center group/item">
                      <span className="w-3 h-3 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full mr-4 group-hover/item:scale-125 transition-transform duration-300"></span>
                      <span className="group-hover/item:text-white transition-colors duration-300">Optimize for ATS systems</span>
                    </li>
                    <li className="flex items-center group/item">
                      <span className="w-3 h-3 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full mr-4 group-hover/item:scale-125 transition-transform duration-300"></span>
                      <span className="group-hover/item:text-white transition-colors duration-300">Follow Harvard methodology</span>
                    </li>
                  </ul>
                </div>
                
                <Link 
                  href={user ? "/dashboard" : "/login"}
                  className="block w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-6 px-8 rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 font-semibold text-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105 transform"
                >
                  {user ? "Go to Dashboard" : "Start Building"}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-20">
          <h2 className="text-5xl font-bold text-center text-white mb-16">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary-700 to-secondary-800 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-primary-400 font-bold text-3xl">1</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-primary-400 transition-colors duration-300">Upload or Start</h3>
              <p className="text-secondary-300 text-lg leading-relaxed">
                Upload your existing resume or begin with a blank canvas
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary-700 to-secondary-800 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-primary-400 font-bold text-3xl">2</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-primary-400 transition-colors duration-300">AI Enhancement</h3>
              <p className="text-secondary-300 text-lg leading-relaxed">
                Our AI transforms your language into professional Harvard methodology
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary-700 to-secondary-800 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-primary-400 font-bold text-3xl">3</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-primary-400 transition-colors duration-300">Export & Apply</h3>
              <p className="text-secondary-300 text-lg leading-relaxed">
                Download your perfectly formatted Word document ready for applications
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="group bg-secondary-800/50 backdrop-blur-xl rounded-2xl p-8 border border-secondary-700/50 hover:border-primary-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/10">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/25 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-4 group-hover:text-primary-400 transition-colors duration-300">AI-Powered</h3>
            <p className="text-secondary-400 leading-relaxed">Advanced language transformation using Claude AI</p>
          </div>

          <div className="group bg-secondary-800/50 backdrop-blur-xl rounded-2xl p-8 border border-secondary-700/50 hover:border-accent-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-accent-500/10">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-accent-500/25 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-4 group-hover:text-accent-400 transition-colors duration-300">Harvard Method</h3>
            <p className="text-secondary-400 leading-relaxed">Built-in best practices and methodology</p>
          </div>

          <div className="group bg-secondary-800/50 backdrop-blur-xl rounded-2xl p-8 border border-secondary-700/50 hover:border-primary-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/10">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/25 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-4 group-hover:text-primary-400 transition-colors duration-300">ATS Optimized</h3>
            <p className="text-secondary-400 leading-relaxed">Keyword integration and format compatibility</p>
          </div>

          <div className="group bg-secondary-800/50 backdrop-blur-xl rounded-2xl p-8 border border-secondary-700/50 hover:border-accent-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-accent-500/10">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-accent-500/25 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-4 group-hover:text-accent-400 transition-colors duration-300">Export Ready</h3>
            <p className="text-secondary-400 leading-relaxed">Professional Word document generation</p>
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="relative bg-secondary-800/50 backdrop-blur-xl border-t border-secondary-700/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Main Footer Content */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-primary-500/25">
                <img 
                  src="/logo_white.png" 
                  alt="resApp Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
              <img 
                  src="/logo_letter.png" 
                  alt="resApp Logo_letter" 
                  className="w-32 h-12 object-contain"
                />
              </div>
            </div>
            <p className="text-secondary-300 text-lg max-w-2xl mx-auto mb-8">
              Transform your resume with AI-powered Harvard methodology. Upload existing resumes or build from scratch with intelligent suggestions and ATS optimization.
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center space-x-2 bg-primary-500/10 border border-primary-500/30 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span className="text-primary-400 text-sm font-medium">95% Success Rate</span>
              </div>
              <div className="flex items-center space-x-2 bg-accent-500/10 border border-accent-500/30 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                <span className="text-accent-400 text-sm font-medium">Harvard Method</span>
              </div>
              <div className="flex items-center space-x-2 bg-primary-500/10 border border-primary-500/30 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span className="text-primary-400 text-sm font-medium">ATS Optimized</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <Link href="/builder" className="text-secondary-400 hover:text-primary-400 transition-colors duration-300 font-medium">
                Resume Builder
              </Link>
              <Link href="/upload" className="text-secondary-400 hover:text-primary-400 transition-colors duration-300 font-medium">
                Upload Resume
              </Link>
              <Link href="/dashboard" className="text-secondary-400 hover:text-primary-400 transition-colors duration-300 font-medium">
                Dashboard
              </Link>
              <Link href="/login" className="text-secondary-400 hover:text-primary-400 transition-colors duration-300 font-medium">
                Sign In
              </Link>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-secondary-700/50 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 mb-4 md:mb-0">
                <span className="text-secondary-400 text-sm">© 2025 resApp. All rights reserved.</span>
                <div className="flex space-x-4">
                  <Link href="#" className="text-secondary-400 hover:text-primary-400 transition-colors duration-300 text-sm">
                    Privacy Policy
                  </Link>
                  <Link href="#" className="text-secondary-400 hover:text-primary-400 transition-colors duration-300 text-sm">
                    Terms of Service
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full ${i < 4 ? 'bg-primary-400' : 'bg-secondary-600'}`}></div>
                  ))}
                </div>
                <span className="text-secondary-400 text-sm">4.8/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Notification */}
      <Notification
        isVisible={notification.isVisible}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
