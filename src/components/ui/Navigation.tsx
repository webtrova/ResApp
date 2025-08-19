'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface NavigationProps {
  currentPage?: string;
  showProgress?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export default function Navigation({ 
  currentPage = 'home',
  showProgress = false,
  currentStep = 1,
  totalSteps = 6
}: NavigationProps) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-secondary-900/95 backdrop-blur-xl border-b border-secondary-800/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo and Brand - Using same structure as main page */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden">
              <img 
                src="/logo_white.png" 
                alt="resApp Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <div>
              <img 
                src="/logo_letter.png" 
                alt="resApp Logo Letters" 
                className="w-32 h-12 object-contain"
              />
            </div>
          </Link>

          {/* Progress Indicator (for builder page) */}
          {showProgress && (
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <p className="text-sm font-medium text-secondary-300">Step {currentStep} of {totalSteps}</p>
                <div className="flex space-x-1 mt-1">
                  {Array.from({ length: totalSteps }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                        i + 1 <= currentStep ? 'bg-primary-500' : 'bg-secondary-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isLoading ? (
              <div className="flex items-center space-x-4">
                <div className="text-secondary-300 text-sm">Loading...</div>
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={`text-sm font-medium transition-colors duration-300 ${
                    currentPage === 'dashboard' 
                      ? 'text-primary-400' 
                      : 'text-secondary-300 hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/builder" 
                  className={`text-sm font-medium transition-colors duration-300 ${
                    currentPage === 'builder' 
                      ? 'text-primary-400' 
                      : 'text-secondary-300 hover:text-white'
                  }`}
                >
                  Builder
                </Link>
                <Link 
                  href="/upload" 
                  className={`text-sm font-medium transition-colors duration-300 ${
                    currentPage === 'upload' 
                      ? 'text-primary-400' 
                      : 'text-secondary-300 hover:text-white'
                  }`}
                >
                  Upload
                </Link>
                <Link 
                  href="/cover-letter-builder" 
                  className={`text-sm font-medium transition-colors duration-300 ${
                    currentPage === 'cover-letter-builder' 
                      ? 'text-primary-400' 
                      : 'text-secondary-300 hover:text-white'
                  }`}
                >
                  Cover Letters
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-secondary-300 text-sm">Welcome, {user.firstName}!</div>
                  </div>
                  <Link 
                    href="/dashboard" 
                    className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg transition-all duration-300 text-sm font-medium"
                  >
                    My Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-secondary-300 hover:text-white transition-colors duration-300 text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-secondary-300 hover:text-white transition-colors duration-300 text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl transition-all duration-300 text-sm font-medium shadow-lg shadow-primary-500/25"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Modern Hamburger Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="relative w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 backdrop-blur-sm border border-primary-500/30 rounded-xl flex items-center justify-center text-white hover:text-white transition-all duration-300 group shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
            >
              {/* Animated Hamburger Lines */}
              <div className="flex flex-col items-center justify-center w-6 h-6 space-y-1.5">
                <span className={`block w-6 h-0.5 bg-current transition-all duration-500 ease-in-out transform ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`}></span>
                <span className={`block w-6 h-0.5 bg-current transition-all duration-500 ease-in-out ${
                  isMobileMenuOpen ? 'opacity-0' : ''
                }`}></span>
                <span className={`block w-6 h-0.5 bg-current transition-all duration-500 ease-in-out transform ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}></span>
              </div>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>

        {/* Smooth Mobile Menu Dropdown */}
        <div className={`md:hidden transition-all duration-700 ease-out overflow-hidden ${
          isMobileMenuOpen 
            ? 'max-h-[500px] opacity-100 mt-6 transform translate-y-0' 
            : 'max-h-0 opacity-0 mt-0 transform -translate-y-8'
        }`}>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-4 transform transition-all duration-700 ease-out">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="flex items-center space-x-3">
                  <div className="text-secondary-300 text-sm">Loading...</div>
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            ) : user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${
                    currentPage === 'dashboard' 
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' 
                      : 'text-secondary-300 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-2 h-2 bg-current rounded-full mr-3 group-hover:scale-125 transition-transform duration-300"></div>
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link 
                  href="/builder" 
                  className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${
                    currentPage === 'builder' 
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' 
                      : 'text-secondary-300 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-2 h-2 bg-current rounded-full mr-3 group-hover:scale-125 transition-transform duration-300"></div>
                  <span className="font-medium">Builder</span>
                </Link>
                <Link 
                  href="/upload" 
                  className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${
                    currentPage === 'upload' 
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' 
                      : 'text-secondary-300 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-2 h-2 bg-current rounded-full mr-3 group-hover:scale-125 transition-transform duration-300"></div>
                  <span className="font-medium">Upload</span>
                </Link>
                <Link 
                  href="/cover-letter-builder" 
                  className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${
                    currentPage === 'cover-letter-builder' 
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' 
                      : 'text-secondary-300 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-2 h-2 bg-current rounded-full mr-3 group-hover:scale-125 transition-transform duration-300"></div>
                  <span className="font-medium">Cover Letters</span>
                </Link>
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="text-secondary-300 text-sm">
                      Welcome, {user.firstName}!
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-secondary-300 hover:text-white transition-colors duration-300 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/10"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="flex items-center px-4 py-3 text-secondary-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 group"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-2 h-2 bg-current rounded-full mr-3 group-hover:scale-125 transition-transform duration-300"></div>
                  <span className="font-medium">Sign In</span>
                </Link>
                <Link 
                  href="/register" 
                  className="flex items-center px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl transition-all duration-300 font-medium group"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-2 h-2 bg-white rounded-full mr-3 group-hover:scale-125 transition-transform duration-300"></div>
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
