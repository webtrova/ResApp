'use client';

import React from 'react';
import { CoverLetterData } from '../../types/resume';

interface CoverLetterPreviewProps {
  coverLetterData: CoverLetterData;
}

export default function CoverLetterPreview({ coverLetterData }: CoverLetterPreviewProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const wordCount = coverLetterData.opening.split(' ').length + 
    coverLetterData.body.reduce((acc, p) => acc + p.content.split(' ').length, 0) + 
    coverLetterData.closing.split(' ').length;

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Cover Letter Preview</h3>
          <p className="text-gray-600">Professional format ready for submission</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-600 font-medium">Ready</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 max-h-[700px] overflow-y-auto shadow-inner">
        {/* Header with Personal Info */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="text-sm text-gray-600 mb-3 font-medium">
            {coverLetterData.personalInfo.fullName}
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {coverLetterData.personalInfo.email}
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {coverLetterData.personalInfo.phone}
            </div>
            {coverLetterData.personalInfo.location && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {coverLetterData.personalInfo.location}
              </div>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="mb-8">
          <div className="text-sm text-gray-600 font-medium">
            {formatDate(coverLetterData.jobDetails.applicationDate) || new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        {/* Company Address */}
        {coverLetterData.jobDetails.companyAddress && (
          <div className="mb-8">
            <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
              {coverLetterData.jobDetails.companyAddress}
            </div>
          </div>
        )}

        {/* Greeting */}
        <div className="mb-8">
          <div className="text-sm text-gray-600 font-medium">
            {coverLetterData.jobDetails.contactPerson 
              ? `Dear ${coverLetterData.jobDetails.contactPerson},`
              : 'Dear Hiring Manager,'
            }
          </div>
        </div>

        {/* Opening Paragraph */}
        <div className="mb-6">
          <div className="text-sm text-gray-900 leading-relaxed">
            {coverLetterData.opening}
          </div>
        </div>

        {/* Body Paragraphs */}
        {coverLetterData.body.map((paragraph, index) => (
          <div key={paragraph.id} className="mb-6">
            <div className="text-sm text-gray-900 leading-relaxed">
              {paragraph.content}
            </div>
          </div>
        ))}

        {/* Closing Paragraph */}
        <div className="mb-8">
          <div className="text-sm text-gray-900 leading-relaxed">
            {coverLetterData.closing}
          </div>
        </div>

        {/* Signature */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
            {coverLetterData.signature}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="text-xs text-blue-800">
              <div className="font-semibold mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Job Details
              </div>
              <div className="space-y-1">
                <div className="flex items-center">
                  <span className="font-medium w-20">Position:</span>
                  <span>{coverLetterData.jobDetails.jobTitle}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-20">Company:</span>
                  <span>{coverLetterData.jobDetails.companyName}</span>
                </div>
                {coverLetterData.jobDetails.contactEmail && (
                  <div className="flex items-center">
                    <span className="font-medium w-20">Contact:</span>
                    <span>{coverLetterData.jobDetails.contactEmail}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{wordCount} words</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{Math.ceil(wordCount / 200)} min read</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-600 font-medium">ATS Optimized</span>
        </div>
      </div>
    </div>
  );
}
