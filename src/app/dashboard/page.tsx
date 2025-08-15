'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/ui/Navigation';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Upload Resume Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-500/20 to-primary-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <Link 
                href="/upload"
                className="relative block bg-secondary-800/50 backdrop-blur-xl rounded-3xl border border-secondary-700/50 p-8 shadow-2xl hover:shadow-accent-500/25 transition-all duration-500 hover:scale-105 group"
              >
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-accent-500 to-primary-500 flex items-center justify-center shadow-lg shadow-accent-500/25 group-hover:shadow-xl group-hover:shadow-accent-500/40 transition-all duration-500">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
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
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-xl group-hover:shadow-primary-500/40 transition-all duration-500">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
          </div>

          {/* Recent Resumes Section */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Recent Resumes</h3>
              <p className="text-secondary-400">Continue working on your existing resumes</p>
            </div>
            <div className="bg-secondary-800/30 backdrop-blur-xl rounded-2xl border border-secondary-700/50 p-6">
              <div className="text-center text-secondary-400">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No resumes yet. Create your first resume to get started!</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
