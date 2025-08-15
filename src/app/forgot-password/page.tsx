'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Notification from '@/components/ui/Notification';
import Navigation from '@/components/ui/Navigation';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
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

  const router = useRouter();

  // Debug notification state changes
  useEffect(() => {
    console.log('Notification state changed:', notification);
  }, [notification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== FORGOT PASSWORD SUBMIT START ===');
    console.log('Email:', email);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      console.log('=== FORGOT PASSWORD DEBUG ===');
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Forgot password response:', data);

      if (data.success) {
        console.log('Setting success notification');
        setNotification({
          isVisible: true,
          type: 'success',
          title: 'Reset Link Sent!',
          message: 'Check your email for password reset instructions.'
        });
        setEmail('');
        setEmailSent(true);
      } else {
        console.log('Setting error notification:', data.error);
        setNotification({
          isVisible: true,
          type: 'error',
          title: 'Reset Failed',
          message: data.error || 'Failed to send reset link'
        });
      }
      console.log('=== END FORGOT PASSWORD DEBUG ===');
    } catch (error) {
      console.log('=== FORGOT PASSWORD ERROR ===');
      console.error('Forgot password error:', error);
      setNotification({
        isVisible: true,
        type: 'error',
        title: 'Reset Failed',
        message: 'An error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Beautiful post-email page
  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 text-white">
        {/* Navigation */}
        <Navigation currentPage="forgot-password" />

        {/* Main Content */}
        <main className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-4xl">
            {/* Success Header */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Check Your Email!</h1>
              <p className="text-xl text-secondary-300 max-w-2xl mx-auto">
                We've sent password reset instructions to your email address. 
                Follow the link in the email to reset your password.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {/* Card 1 */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Parsing</h3>
                <p className="text-secondary-300">
                  Our advanced AI extracts and organizes your resume content with remarkable accuracy.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Harvard Template</h3>
                <p className="text-secondary-300">
                  Build your resume using the prestigious Harvard Business School template format.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Live Preview</h3>
                <p className="text-secondary-300">
                  See your resume come to life in real-time as you build it step by step.
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-4">Ready to Continue?</h2>
                <p className="text-secondary-300 mb-6">
                  Once you've reset your password, you can log back in and continue building your professional resume.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/login" 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 px-8 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105 transform"
                  >
                    Back to Login
                  </Link>
                  <button
                    onClick={() => setEmailSent(false)}
                    className="bg-white/10 hover:bg-white/20 text-white py-3 px-8 rounded-xl font-medium transition-all duration-300 border border-white/20 hover:border-white/30"
                  >
                    Send Another Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Notification */}
        {notification.isVisible && (
          <Notification
            isVisible={notification.isVisible}
            type={notification.type}
            title={notification.title}
            message={notification.message}
            onClose={() => setNotification({ ...notification, isVisible: false })}
          />
        )}
      </div>
    );
  }

  // Original forgot password form
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 text-white">
      {/* Navigation */}
      <Navigation currentPage="forgot-password" />

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Forgot Password Form Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
              <p className="text-secondary-300">Enter your email to receive reset instructions</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-secondary-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your email"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-secondary-300">
                Remember your password?{' '}
                <Link 
                  href="/login" 
                  className="text-primary-400 hover:text-primary-300 font-medium transition-colors duration-300"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Notification */}
      {notification.isVisible && (
        <Notification
          isVisible={notification.isVisible}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification({ ...notification, isVisible: false })}
        />
      )}
    </div>
  );
}
