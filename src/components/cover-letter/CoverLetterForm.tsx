'use client';

import React, { useState } from 'react';
import { CoverLetterData } from '../../types/resume';
import AIEnhanceButton from '../ai/AIEnhanceButton';

interface CoverLetterFormProps {
  coverLetterData: CoverLetterData;
  onUpdate: (data: CoverLetterData) => void;
  onSave: () => void;
}

export default function CoverLetterForm({ coverLetterData, onUpdate, onSave }: CoverLetterFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleContentChange = (section: keyof CoverLetterData, value: string) => {
    onUpdate({
      ...coverLetterData,
      [section]: value
    });
  };

  const handleBodyChange = (index: number, value: string) => {
    const updatedBody = [...coverLetterData.body];
    updatedBody[index] = {
      ...updatedBody[index],
      content: value
    };
    
    onUpdate({
      ...coverLetterData,
      body: updatedBody
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Edit Cover Letter</h3>
          <p className="text-gray-600">Make final adjustments to your cover letter</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-6 py-3 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            {isEditing ? (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </div>
            )}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 text-sm bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all duration-200 font-medium shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40 transform hover:scale-105"
          >
            {isSaving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Cover Letter
              </div>
            )}
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-8">
          {/* Opening Paragraph */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-blue-900">Opening Paragraph</h4>
            </div>
            <div className="relative">
              <textarea
                value={coverLetterData.opening}
                onChange={(e) => handleContentChange('opening', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white resize-none"
                placeholder="Write your opening paragraph..."
              />
              <div className="absolute top-3 right-3">
                <AIEnhanceButton
                  text={coverLetterData.opening}
                  onAccept={(enhanced) => handleContentChange('opening', enhanced)}
                  context={{
                    type: 'cover_letter_opening',
                    jobTitle: coverLetterData.jobDetails.jobTitle,
                    companyName: coverLetterData.jobDetails.companyName
                  }}
                />
              </div>
            </div>
          </div>

          {/* Body Paragraphs */}
          {coverLetterData.body.map((paragraph, index) => (
            <div key={paragraph.id} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-green-900">
                  Body Paragraph {index + 1} 
                  <span className="ml-2 text-sm font-normal text-green-700 bg-green-200 px-2 py-1 rounded-full">
                    {paragraph.type}
                  </span>
                </h4>
              </div>
              <div className="relative">
                <textarea
                  value={paragraph.content}
                  onChange={(e) => handleBodyChange(index, e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white resize-none"
                  placeholder={`Write your ${paragraph.type} paragraph...`}
                />
                <div className="absolute top-3 right-3">
                  <AIEnhanceButton
                    text={paragraph.content}
                    onAccept={(enhanced) => handleBodyChange(index, enhanced)}
                    context={{
                      type: `cover_letter_${paragraph.type}`,
                      jobTitle: coverLetterData.jobDetails.jobTitle,
                      companyName: coverLetterData.jobDetails.companyName
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Closing Paragraph */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-purple-900">Closing Paragraph</h4>
            </div>
            <div className="relative">
              <textarea
                value={coverLetterData.closing}
                onChange={(e) => handleContentChange('closing', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white resize-none"
                placeholder="Write your closing paragraph..."
              />
              <div className="absolute top-3 right-3">
                <AIEnhanceButton
                  text={coverLetterData.closing}
                  onAccept={(enhanced) => handleContentChange('closing', enhanced)}
                  context={{
                    type: 'cover_letter_closing',
                    jobTitle: coverLetterData.jobDetails.jobTitle,
                    companyName: coverLetterData.jobDetails.companyName
                  }}
                />
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Signature</h4>
            </div>
            <textarea
              value={coverLetterData.signature}
              onChange={(e) => handleContentChange('signature', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 bg-white resize-none"
              placeholder="Your signature..."
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-green-900 mb-1">Cover Letter Generated Successfully!</h4>
                <p className="text-green-700">Your AI-powered cover letter is ready for review</p>
              </div>
            </div>
            <p className="text-green-800 text-sm leading-relaxed">
              Your cover letter has been created based on your resume and job details. 
              Click "Edit" to make any adjustments, or "Save Cover Letter" to save it to your account.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-blue-900">Job Details</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white rounded-xl p-4 border border-blue-200">
                <div className="font-semibold text-blue-900 mb-1">Position</div>
                <div className="text-gray-700">{coverLetterData.jobDetails.jobTitle}</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-blue-200">
                <div className="font-semibold text-blue-900 mb-1">Company</div>
                <div className="text-gray-700">{coverLetterData.jobDetails.companyName}</div>
              </div>
              {coverLetterData.jobDetails.contactPerson && (
                <div className="bg-white rounded-xl p-4 border border-blue-200">
                  <div className="font-semibold text-blue-900 mb-1">Contact Person</div>
                  <div className="text-gray-700">{coverLetterData.jobDetails.contactPerson}</div>
                </div>
              )}
              {coverLetterData.jobDetails.contactEmail && (
                <div className="bg-white rounded-xl p-4 border border-blue-200">
                  <div className="font-semibold text-blue-900 mb-1">Contact Email</div>
                  <div className="text-gray-700">{coverLetterData.jobDetails.contactEmail}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
