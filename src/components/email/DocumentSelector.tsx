'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Mail, Download, Send, CheckCircle, Circle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SavedDocument {
  id: string;
  title: string;
  description?: string;
  updated_at: string;
  resume_data?: any;
  cover_letter_data?: any;
  type: 'resume' | 'cover_letter';
}

interface DocumentSelectorProps {
  onDocumentsSelected: (resume: SavedDocument | null, coverLetter: SavedDocument | null) => void;
}

export default function DocumentSelector({ onDocumentsSelected }: DocumentSelectorProps) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [selectedResume, setSelectedResume] = useState<SavedDocument | null>(null);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<SavedDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFormats, setSelectedFormats] = useState({
    resume: 'docx',
    coverLetter: 'docx'
  });

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  const loadDocuments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const authToken = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      // Load resumes
      const resumeResponse = await fetch(`/api/resume/load?userId=${user?.id}`, {
        method: 'GET',
        headers,
      });

      // Load cover letters
      const coverLetterResponse = await fetch(`/api/cover-letter/load?userId=${user?.id}`, {
        method: 'GET',
        headers,
      });

      const resumeData = await resumeResponse.json();
      const coverLetterData = await coverLetterResponse.json();

      const allDocuments: SavedDocument[] = [];

      // Add resumes
      if (resumeData.success && resumeData.resumes) {
        resumeData.resumes.forEach((resume: any) => {
          allDocuments.push({
            id: resume.id,
            title: resume.title,
            description: resume.title,
            updated_at: resume.updated_at,
            resume_data: resume.resume_data,
            type: 'resume'
          });
        });
      }

      // Add cover letters
      if (coverLetterData.success && coverLetterData.coverLetters) {
        coverLetterData.coverLetters.forEach((coverLetter: any) => {
          allDocuments.push({
            id: coverLetter.id,
            title: coverLetter.title,
            description: coverLetter.title,
            updated_at: coverLetter.updated_at,
            cover_letter_data: coverLetter.cover_letter_data,
            type: 'cover_letter'
          });
        });
      }

      setDocuments(allDocuments);
      
      // Auto-select the most recent resume and cover letter
      const resumes = allDocuments.filter(doc => doc.type === 'resume');
      const coverLetters = allDocuments.filter(doc => doc.type === 'cover_letter');
      
      if (resumes.length > 0) {
        setSelectedResume(resumes[0]);
      }
      if (coverLetters.length > 0) {
        setSelectedCoverLetter(coverLetters[0]);
      }

    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentSelect = (document: SavedDocument) => {
    if (document.type === 'resume') {
      setSelectedResume(document);
    } else {
      setSelectedCoverLetter(document);
    }
  };

  const handleDownload = async (document: SavedDocument) => {
    try {
      const endpoint = document.type === 'resume' ? '/api/resume/download' : '/api/cover-letter/download';
      const data = document.type === 'resume' 
        ? { resumeData: document.resume_data } 
        : { coverLetterData: document.cover_letter_data };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${document.title}_${new Date().toISOString().split('T')[0]}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Download failed');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedResume || !selectedCoverLetter) {
      alert('Please select both a resume and cover letter');
      return;
    }

    // Call the parent callback with selected documents
    onDocumentsSelected(selectedResume, selectedCoverLetter);
  };

  if (isLoading) {
    return (
      <div className="bg-secondary-800/50 rounded-2xl border border-secondary-700/50 p-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-white animate-pulse" />
          </div>
          <p className="text-secondary-300">Loading your documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-secondary-800/50 rounded-2xl border border-secondary-700/50 p-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={loadDocuments}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const resumes = documents.filter(doc => doc.type === 'resume');
  const coverLetters = documents.filter(doc => doc.type === 'cover_letter');

  return (
    <div className="bg-secondary-800/50 rounded-2xl border border-secondary-700/50 p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Select Documents</h3>
          <p className="text-secondary-300 text-sm">Choose which resume and cover letter to send</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume Selection */}
        <div className="bg-secondary-700/30 rounded-xl p-4">
          <h4 className="text-lg font-semibold text-white flex items-center mb-4">
            <FileText className="w-5 h-5 mr-2 text-blue-400" />
            Select Resume
          </h4>
          
          {resumes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-secondary-400 mb-4">No resumes found</p>
              <button
                onClick={() => window.location.href = '/builder'}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
              >
                Create Resume
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    selectedResume?.id === resume.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-secondary-600 bg-secondary-600/30 hover:border-secondary-500'
                  }`}
                  onClick={() => handleDocumentSelect(resume)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {selectedResume?.id === resume.id ? (
                        <CheckCircle className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-secondary-400" />
                      )}
                      <div>
                        <h5 className="text-white font-medium">{resume.title}</h5>
                        <p className="text-secondary-400 text-sm">
                          Updated: {new Date(resume.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(resume);
                      }}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1 rounded text-sm transition-all duration-200"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cover Letter Selection */}
        <div className="bg-secondary-700/30 rounded-xl p-4">
          <h4 className="text-lg font-semibold text-white flex items-center mb-4">
            <Mail className="w-5 h-5 mr-2 text-green-400" />
            Select Cover Letter
          </h4>
          
          {coverLetters.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-secondary-400 mb-4">No cover letters found</p>
              <button
                onClick={() => window.location.href = '/cover-letter-builder'}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300"
              >
                Create Cover Letter
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {coverLetters.map((coverLetter) => (
                <div
                  key={coverLetter.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    selectedCoverLetter?.id === coverLetter.id
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-secondary-600 bg-secondary-600/30 hover:border-secondary-500'
                  }`}
                  onClick={() => handleDocumentSelect(coverLetter)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {selectedCoverLetter?.id === coverLetter.id ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-secondary-400" />
                      )}
                      <div>
                        <h5 className="text-white font-medium">{coverLetter.title}</h5>
                        <p className="text-secondary-400 text-sm">
                          Updated: {new Date(coverLetter.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(coverLetter);
                      }}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-1 rounded text-sm transition-all duration-200"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-secondary-700/50">
        <button
          onClick={handleSendEmail}
          disabled={!selectedResume || !selectedCoverLetter}
          className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
          <span>Send Application</span>
        </button>
        
        <button
          onClick={() => {
            if (selectedResume) handleDownload(selectedResume);
            if (selectedCoverLetter) handleDownload(selectedCoverLetter);
          }}
          disabled={!selectedResume || !selectedCoverLetter}
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          <span>Download Both</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <h5 className="text-sm font-semibold text-blue-300 mb-2">Instructions:</h5>
        <ul className="text-sm text-blue-200 space-y-1">
          <li>• Select one resume and one cover letter from your saved documents</li>
          <li>• Click "Download Both" to download the selected documents</li>
          <li>• Click "Send Application" to open your email client</li>
          <li>• Attach the downloaded documents to your email</li>
        </ul>
      </div>
    </div>
  );
}
