'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Notification from '@/components/ui/Notification';
import Navigation from '@/components/ui/Navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const loginSuccess = await login(email, password);
      
      if (loginSuccess) {
        setNotification({
          isVisible: true,
          type: 'success',
          title: 'Login Successful',
          message: 'Welcome back! Redirecting to dashboard...'
        });
        setTimeout(() => {
          router.push('/dashboard');
        }, 1200);
      } else {
        setNotification({
          isVisible: true,
          type: 'error',
          title: 'Login Failed',
          message: 'Invalid email or password. Please try again.'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setNotification({
        isVisible: true,
        type: 'error',
        title: 'Login Failed',
        message: 'An error occurred. Please try again.'
      });
    } finally {
      // Don't set loading to false here - let AuthContext handle it
      // This prevents the jarring jump during login transition
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 text-white">
      {/* Navigation */}
      <Navigation currentPage="login" />

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Login Form Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-secondary-300">Sign in to your resApp account</p>
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

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-secondary-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your password"
                />
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors duration-300"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-secondary-300">
                Don't have an account?{' '}
                <Link 
                  href="/register" 
                  className="text-primary-400 hover:text-primary-300 font-medium transition-colors duration-300"
                >
                  Sign up here
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
