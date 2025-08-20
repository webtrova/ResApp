'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Download, FileText, Send } from 'lucide-react';
import { ResumeData, CoverLetterData } from '@/types/resume';

interface EmailSenderProps {
  resumeData: ResumeData;
  coverLetterData: CoverLetterData;
  jobDetails: any;
}

export default function EmailSender({ resumeData, coverLetterData, jobDetails }: EmailSenderProps) {
  const [emailData, setEmailData] = useState({
    to: '',
    subject: `Application for ${jobDetails?.jobTitle || 'Position'} at ${jobDetails?.companyName || 'Company'}`,
    body: `Dear Hiring Manager,

I am writing to express my interest in the ${jobDetails?.jobTitle || 'position'} at ${jobDetails?.companyName || 'your company'}.

Please find attached my resume and cover letter for your consideration.

I look forward to discussing how my skills and experience can contribute to your team.

Best regards,
${resumeData.personal?.fullName || '[Your Name]'}`
  });
  const [isSending, setIsSending] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState({
    resume: 'docx',
    coverLetter: 'docx'
  });

  const handleDownload = async (type: 'resume' | 'coverLetter') => {
    try {
      const endpoint = type === 'resume' ? '/api/resume/download' : '/api/cover-letter/download';
      const data = type === 'resume' ? { resumeData } : { coverLetterData };
      
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
        a.download = type === 'resume' 
          ? `${resumeData.personal?.fullName || 'Resume'}_${new Date().toISOString().split('T')[0]}.docx`
          : `Cover_Letter_${jobDetails?.jobTitle || 'Position'}_${jobDetails?.companyName || 'Company'}_${new Date().toISOString().split('T')[0]}.docx`;
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
    if (!emailData.to.trim()) {
      alert('Please enter a recipient email address');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...emailData,
          resumeData,
          coverLetterData,
          resumeFormat: selectedFormats.resume,
          coverLetterFormat: selectedFormats.coverLetter
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Open default email client
        window.open(data.mailtoUrl, '_blank');
        
        // Show success message
        alert('Email client opened! Please download and attach the documents before sending.');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to prepare email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to prepare email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-secondary-800/50 rounded-2xl border border-secondary-700/50 p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Send Application</h3>
          <p className="text-secondary-300 text-sm">Download documents and send via email</p>
        </div>
      </div>

      {/* Download Section */}
      <div className="bg-secondary-700/30 rounded-xl p-4 space-y-4">
        <h4 className="text-lg font-semibold text-white flex items-center">
          <Download className="w-5 h-5 mr-2" />
          Download Documents
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Resume Download */}
          <div className="bg-secondary-600/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">Resume</span>
              </div>
              <select
                value={selectedFormats.resume}
                onChange={(e) => setSelectedFormats(prev => ({ ...prev, resume: e.target.value }))}
                className="bg-secondary-700/50 border border-secondary-600/50 rounded px-2 py-1 text-sm text-white"
              >
                <option value="docx">DOCX</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <button
              onClick={() => handleDownload('resume')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Resume</span>
            </button>
          </div>

          {/* Cover Letter Download */}
          <div className="bg-secondary-600/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-green-400" />
                <span className="text-white font-medium">Cover Letter</span>
              </div>
              <select
                value={selectedFormats.coverLetter}
                onChange={(e) => setSelectedFormats(prev => ({ ...prev, coverLetter: e.target.value }))}
                className="bg-secondary-700/50 border border-secondary-600/50 rounded px-2 py-1 text-sm text-white"
              >
                <option value="docx">DOCX</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <button
              onClick={() => handleDownload('coverLetter')}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Cover Letter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Email Form */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white flex items-center">
          <Mail className="w-5 h-5 mr-2" />
          Email Details
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              To (Email Address)
            </label>
            <input
              type="email"
              value={emailData.to}
              onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
              className="w-full px-3 py-2 bg-secondary-700/50 border border-secondary-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="hiring@company.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={emailData.subject}
              onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-3 py-2 bg-secondary-700/50 border border-secondary-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Message
            </label>
            <textarea
              value={emailData.body}
              onChange={(e) => setEmailData(prev => ({ ...prev, body: e.target.value }))}
              rows={6}
              className="w-full px-3 py-2 bg-secondary-700/50 border border-secondary-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
            />
          </div>
        </div>

        <button
          onClick={handleSendEmail}
          disabled={isSending || !emailData.to.trim()}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
          <span>{isSending ? 'Preparing Email...' : 'Send Application'}</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <h5 className="text-sm font-semibold text-blue-300 mb-2">Instructions:</h5>
        <ul className="text-sm text-blue-200 space-y-1">
          <li>• Download your resume and cover letter in your preferred format</li>
          <li>• Fill in the email details above</li>
          <li>• Click "Send Application" to open your default email client</li>
          <li>• Attach the downloaded documents to your email</li>
          <li>• Review and send your application</li>
        </ul>
      </div>
    </div>
  );
}
