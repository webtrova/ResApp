'use client';

import React, { useState } from 'react';
import { JobDetails } from '../../types/resume';

interface JobDetailsFormProps {
  onSubmit: (details: JobDetails) => void;
  initialData?: JobDetails | null;
}

export default function JobDetailsForm({ onSubmit, initialData }: JobDetailsFormProps) {
  const [formData, setFormData] = useState<JobDetails>({
    companyName: initialData?.companyName || '',
    jobTitle: initialData?.jobTitle || '',
    jobDescription: initialData?.jobDescription || '',
    requirements: initialData?.requirements || [],
    applicationDate: initialData?.applicationDate || '',
    contactPerson: initialData?.contactPerson || '',
    contactEmail: initialData?.contactEmail || '',
    companyAddress: initialData?.companyAddress || ''
  });

  const [newRequirement, setNewRequirement] = useState('');

  const handleInputChange = (field: keyof JobDetails, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...(prev.requirements || []), newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.jobTitle) {
      alert('Company name and job title are required');
      return;
    }

    onSubmit(formData);
  };

        return (
    <div>
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/25">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Job Details</h3>
        <p className="text-secondary-300">Tell us about the position you're applying for</p>
      </div>
      
              <form onSubmit={handleSubmit} className="space-y-8">
        {/* Company & Position */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="companyName" className="block text-sm font-semibold text-secondary-300 mb-3">
              Company Name *
            </label>
            <input
              type="text"
              id="companyName"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              className="w-full px-4 py-3 bg-secondary-700/50 border border-secondary-600/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-white placeholder:text-secondary-400"
              placeholder="e.g., Google, Microsoft, Apple"
              required
            />
          </div>

          <div>
            <label htmlFor="jobTitle" className="block text-sm font-semibold text-secondary-300 mb-3">
              Job Title *
            </label>
            <input
              type="text"
              id="jobTitle"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              className="w-full px-4 py-3 bg-secondary-700/50 border border-secondary-600/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-white placeholder:text-secondary-400"
              placeholder="e.g., Senior Software Engineer"
              required
            />
          </div>
        </div>

        {/* Job Description */}
        <div>
          <label htmlFor="jobDescription" className="block text-sm font-semibold text-secondary-300 mb-3">
            Job Description (Optional)
          </label>
          <textarea
            id="jobDescription"
            value={formData.jobDescription}
            onChange={(e) => handleInputChange('jobDescription', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-secondary-700/50 border border-secondary-600/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none text-white placeholder:text-secondary-400"
            placeholder="Paste the job description here to help tailor your cover letter..."
          />
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-semibold text-secondary-300 mb-3">
            Key Requirements (Optional)
          </label>
          <div className="space-y-3 mb-4">
            {formData.requirements?.map((req, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="flex-1 px-4 py-3 bg-secondary-700/30 border border-secondary-600/50 rounded-xl text-sm font-medium text-white">
                  {req}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveRequirement(index)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <div className="flex gap-3">
              <input
                type="text"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}
                className="flex-1 px-4 py-3 bg-secondary-700/50 border border-secondary-600/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-white placeholder:text-secondary-400"
                placeholder="Add a requirement..."
              />
              <button
                type="button"
                onClick={handleAddRequirement}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-medium shadow-sm"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="contactPerson" className="block text-sm font-semibold text-secondary-300 mb-3">
              Contact Person
            </label>
            <input
              type="text"
              id="contactPerson"
              value={formData.contactPerson}
              onChange={(e) => handleInputChange('contactPerson', e.target.value)}
              className="w-full px-4 py-3 bg-secondary-700/50 border border-secondary-600/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-white placeholder:text-secondary-400"
              placeholder="e.g., John Smith, Hiring Manager"
            />
          </div>

          <div>
            <label htmlFor="contactEmail" className="block text-sm font-semibold text-secondary-300 mb-3">
              Contact Email
            </label>
            <input
              type="email"
              id="contactEmail"
              value={formData.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              className="w-full px-4 py-3 bg-secondary-700/50 border border-secondary-600/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-white placeholder:text-secondary-400"
              placeholder="e.g., hiring@company.com"
            />
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="applicationDate" className="block text-sm font-semibold text-secondary-300 mb-3">
              Application Date
            </label>
            <input
              type="date"
              id="applicationDate"
              value={formData.applicationDate}
              onChange={(e) => handleInputChange('applicationDate', e.target.value)}
              className="w-full px-4 py-3 bg-secondary-700/50 border border-secondary-600/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-white"
            />
          </div>

          <div>
            <label htmlFor="companyAddress" className="block text-sm font-semibold text-secondary-300 mb-3">
              Company Address
            </label>
            <textarea
              id="companyAddress"
              value={formData.companyAddress}
              onChange={(e) => handleInputChange('companyAddress', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-secondary-700/50 border border-secondary-600/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none text-white placeholder:text-secondary-400"
              placeholder="Company address for formal cover letters..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 px-6 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 font-semibold text-lg shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40 transform hover:scale-105"
          >
            Continue to Options
          </button>
        </div>
      </form>
    </div>
  );
}
