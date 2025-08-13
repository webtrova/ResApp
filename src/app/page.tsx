'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
        alert(result.error || 'Failed to upload resume');
        setIsUploading(false);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload resume. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            left: `${mousePosition.x * 0.1}px`,
            top: `${mousePosition.y * 0.1}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      </div>

      {/* Header */}
      <header className="relative bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25 overflow-hidden animate-pulse">
                <img 
                  src="/logo.png" 
                  alt="ResumeStudio Logo" 
                  className="w-full h-full object-cover brightness-0 invert"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  ResumeStudio
                </h1>
                <span className="text-sm text-gray-400">AI-Powered Resume Builder</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-300">
                    Welcome, {user.firstName}!
                  </span>
                                     <Link 
                     href="/dashboard" 
                     className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-medium shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105 transform"
                   >
                     My Dashboard
                   </Link>
                  <button
                    onClick={logout}
                    className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href={user ? "/builder" : "/login"} 
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-medium shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105 transform"
                  >
                    {user ? "My Resumes" : "Get Started"}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Transform Simple Language
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent animate-pulse">
                into Professional Excellence
              </span>
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-16 leading-relaxed">
            Upload your existing resume or start from scratch. Our AI transforms your everyday descriptions 
            into <span className="text-green-400 font-semibold">Harvard methodology-compliant</span> professional content that gets you noticed.
          </p>
          
          {/* Success Metrics Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
            <div className="group bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-green-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/10">
              <div className="text-4xl font-bold text-green-400 mb-3 group-hover:scale-110 transition-transform duration-300">95%</div>
              <div className="text-gray-400 font-medium">Success Rate</div>
              <div className="w-full bg-gray-700 rounded-full h-1 mt-4">
                <div className="bg-gradient-to-r from-green-400 to-green-600 h-1 rounded-full animate-pulse" style={{ width: '95%' }}></div>
              </div>
            </div>
            
            <div className="group bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="text-4xl font-bold text-blue-400 mb-3 group-hover:scale-110 transition-transform duration-300">&lt;30 min</div>
              <div className="text-gray-400 font-medium">Time to Complete</div>
              <div className="w-full bg-gray-700 rounded-full h-1 mt-4">
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-1 rounded-full animate-pulse" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div className="group bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="text-4xl font-bold text-purple-400 mb-3 group-hover:scale-110 transition-transform duration-300">4.8/5</div>
              <div className="text-gray-400 font-medium">User Rating</div>
              <div className="flex justify-center mt-4 space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i < 4 ? 'bg-yellow-400' : 'bg-gray-600'}`}></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dual Entry Point Cards */}
        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto mb-20">
          {/* Option A: Upload Existing Resume */}
          <div className="group bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-10 hover:border-green-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">Upload Existing Resume</h3>
              <p className="text-gray-300 mb-10 text-lg leading-relaxed">
                Upload your current resume and let AI enhance it with Harvard methodology
              </p>
              
              <div className="space-y-8">
                <div className="text-sm text-gray-400">
                  <div className="font-semibold mb-4 text-white text-lg">Supported formats:</div>
                  <div className="flex justify-center space-x-4">
                    <span className="bg-gray-700/50 backdrop-blur-sm px-4 py-2 rounded-lg text-white border border-gray-600/50 hover:border-green-500/50 transition-colors duration-300">PDF</span>
                    <span className="bg-gray-700/50 backdrop-blur-sm px-4 py-2 rounded-lg text-white border border-gray-600/50 hover:border-green-500/50 transition-colors duration-300">Word</span>
                    <span className="bg-gray-700/50 backdrop-blur-sm px-4 py-2 rounded-lg text-white border border-gray-600/50 hover:border-green-500/50 transition-colors duration-300">Text</span>
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
                    w-full py-6 px-8 rounded-2xl border-2 border-dashed border-gray-600/50 
                    hover:border-green-500 hover:bg-gray-700/30 transition-all duration-300 cursor-pointer
                    backdrop-blur-sm group-hover:shadow-lg group-hover:shadow-green-500/20
                    ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}>
                    {isUploading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mr-3"></div>
                        <span className="text-white font-medium">Processing...</span>
                      </div>
                    ) : uploadSuccess ? (
                      <div className="text-center">
                        <div className="text-green-400 font-semibold text-xl mb-2">✅ Upload Successful!</div>
                        <div className="text-gray-400">Redirecting to resume builder...</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-green-400 font-semibold text-xl mb-2">Choose file or drag here</div>
                        <div className="text-gray-400">AI will extract and optimize your content</div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Option B: Start From Scratch */}
          <div className="group bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-10 hover:border-green-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">Start From Scratch</h3>
              <p className="text-gray-300 mb-10 text-lg leading-relaxed">
                Build your resume step by step with AI-powered language enhancement
              </p>
              
              <div className="space-y-8">
                <div className="text-sm text-gray-400">
                  <div className="font-semibold mb-4 text-white text-lg">AI will help you:</div>
                  <ul className="text-left space-y-3">
                    <li className="flex items-center group/item">
                      <span className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full mr-4 group-hover/item:scale-125 transition-transform duration-300"></span>
                      <span className="group-hover/item:text-white transition-colors duration-300">Transform simple descriptions</span>
                    </li>
                    <li className="flex items-center group/item">
                      <span className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full mr-4 group-hover/item:scale-125 transition-transform duration-300"></span>
                      <span className="group-hover/item:text-white transition-colors duration-300">Add professional metrics</span>
                    </li>
                    <li className="flex items-center group/item">
                      <span className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full mr-4 group-hover/item:scale-125 transition-transform duration-300"></span>
                      <span className="group-hover/item:text-white transition-colors duration-300">Optimize for ATS systems</span>
                    </li>
                    <li className="flex items-center group/item">
                      <span className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full mr-4 group-hover/item:scale-125 transition-transform duration-300"></span>
                      <span className="group-hover/item:text-white transition-colors duration-300">Follow Harvard methodology</span>
                    </li>
                  </ul>
                </div>
                
                <Link 
                  href={user ? "/dashboard" : "/login"}
                  className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-6 px-8 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold text-xl shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105 transform"
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
              <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-green-400 font-bold text-3xl">1</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-green-400 transition-colors duration-300">Upload or Start</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Upload your existing resume or begin with a blank canvas
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-green-400 font-bold text-3xl">2</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-green-400 transition-colors duration-300">AI Enhancement</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Our AI transforms your language into professional Harvard methodology
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-green-400 font-bold text-3xl">3</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-green-400 transition-colors duration-300">Export & Apply</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Download your perfectly formatted Word document ready for applications
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="group bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors duration-300">AI-Powered</h3>
            <p className="text-gray-400 leading-relaxed">Advanced language transformation using Claude AI</p>
          </div>

          <div className="group bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-green-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/10">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors duration-300">Harvard Method</h3>
            <p className="text-gray-400 leading-relaxed">Built-in best practices and methodology</p>
          </div>

          <div className="group bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors duration-300">ATS Optimized</h3>
            <p className="text-gray-400 leading-relaxed">Keyword integration and format compatibility</p>
          </div>

          <div className="group bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-orange-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/10">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/25 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-4 group-hover:text-orange-400 transition-colors duration-300">Export Ready</h3>
            <p className="text-gray-400 leading-relaxed">Professional Word document generation</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative bg-gray-800/50 backdrop-blur-xl border-t border-gray-700/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-green-500/25">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <h3 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                ResumeStudio
              </h3>
            </div>
            <p className="text-gray-400 text-lg">
              Transform your resume with AI-powered Harvard methodology
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
