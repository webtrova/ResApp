'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Notification from '@/components/ui/Notification';
import Navigation from '@/components/ui/Navigation';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
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
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setNotification({
        isVisible: true,
        type: 'error',
        title: 'Invalid Reset Link',
        message: 'The password reset link is invalid or has expired.'
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setNotification({
        isVisible: true,
        type: 'error',
        title: 'Passwords Don\'t Match',
        message: 'Please make sure both passwords are identical.'
      });
      return;
    }

    if (password.length < 6) {
      setNotification({
        isVisible: true,
        type: 'error',
        title: 'Password Too Short',
        message: 'Password must be at least 6 characters long.'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (data.success) {
        setNotification({
          isVisible: true,
          type: 'success',
          title: 'Password Reset Successful!',
          message: 'Logging you in automatically...'
        });
        console.log('Password reset successful, attempting to log in...');
        
        // Automatically log in the user with their email and new password
        if (data.email) {
          const loginSuccess = await login(data.email, password);
          if (loginSuccess) {
            setNotification({
              isVisible: true,
              type: 'success',
              title: '🎉 Welcome Back!',
              message: 'Password updated successfully! Redirecting to your dashboard...'
            });
            console.log('Login successful, redirecting to dashboard...');
            setTimeout(() => {
              console.log('Executing redirect to dashboard...');
              router.push('/dashboard');
            }, 2000);
          } else {
            setNotification({
              isVisible: true,
              type: 'error',
              title: 'Login Failed',
              message: 'Password was reset successfully, but automatic login failed. Please log in manually.'
            });
          }
        } else {
          setNotification({
            isVisible: true,
            type: 'error',
            title: 'Login Failed',
            message: 'Password was reset successfully, but automatic login failed. Please log in manually.'
          });
        }
      } else {
        setNotification({
          isVisible: true,
          type: 'error',
          title: 'Reset Failed',
          message: data.error || 'Failed to reset password. Please try again.'
        });
      }
    } catch (error) {
      setNotification({
        isVisible: true,
        type: 'error',
        title: 'Network Error',
        message: 'An error occurred while connecting to the server. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 text-white">
      {/* Navigation */}
      <Navigation currentPage="reset-password" />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
              <p className="text-secondary-300">Enter your new password</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-secondary-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !token}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>

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
