// app/api/enhance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EnhancementEngine } from '@/lib/enhancement/enhancement-engine';

export async function POST(request: NextRequest) {
  try {
    const { text, industry, roleLevel, context } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    
    const engine = new EnhancementEngine();
    const result = engine.enhance({
      originalText: text,
      industry: industry || 'general',
      roleLevel: roleLevel || 'entry',
      context
    });
    
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Enhancement error:', error);
    return NextResponse.json(
      { error: 'Enhancement failed' }, 
      { status: 500 }
    );
  }
}

// app/api/cover-letter/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CoverLetterEngine } from '@/lib/enhancement/enhancement-engine';

export async function POST(request: NextRequest) {
  try {
    const coverLetterData = await request.json();
    
    const engine = new CoverLetterEngine();
    const coverLetter = engine.generateCoverLetter(coverLetterData);
    
    return NextResponse.json({
      success: true,
      coverLetter
    });
    
  } catch (error) {
    console.error('Cover letter generation error:', error);
    return NextResponse.json(
      { error: 'Cover letter generation failed' }, 
      { status: 500 }
    );
  }
}

// Example React component for using the enhancement
// components/EnhancementWidget.tsx
import React, { useState } from 'react';

interface EnhancementWidgetProps {
  initialText: string;
  industry?: string;
  roleLevel?: string;
  onAccept: (enhancedText: string) => void;
}

export const EnhancementWidget: React.FC<EnhancementWidgetProps> = ({
  initialText,
  industry,
  roleLevel,
  onAccept
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancement, setEnhancement] = useState<any>(null);
  const [selectedQuantification, setSelectedQuantification] = useState<any>(null);

  const handleEnhance = async () => {
    setIsEnhancing(true);
    try {
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: initialText,
          industry,
          roleLevel
        })
      });

      const result = await response.json();
      if (result.success) {
        setEnhancement(result.data);
      }
    } catch (error) {
      console.error('Enhancement failed:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleQuantificationSelect = (option: string, template: string) => {
    const quantifiedText = template.replace('{size}', option).replace('{volume}', option).replace('{percentage}', option);
    setSelectedQuantification(quantifiedText);
  };

  const handleAccept = () => {
    const finalText = selectedQuantification || enhancement?.enhancedText || initialText;
    onAccept(finalText);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      {/* Original Text */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">What you wrote:</h3>
        <div className="p-3 bg-gray-50 rounded border text-gray-800">
          {initialText}
        </div>
      </div>

      {/* Enhancement Button */}
      {!enhancement && (
        <button
          onClick={handleEnhance}
          disabled={isEnhancing}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50"
        >
          {isEnhancing ? 'Enhancing...' : '✨ Enhance with Harvard Method'}
        </button>
      )}

      {/* Enhanced Result */}
      {enhancement && (
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">✨ Enhanced version:</h3>
            <div className="p-3 bg-blue-50 rounded border border-blue-200 text-gray-800">
              {selectedQuantification || enhancement.enhancedText}
            </div>
          </div>

          {/* Quantification Options */}
          {enhancement.improvements.quantificationSuggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Want to customize?</h4>
              {enhancement.improvements.quantificationSuggestions.map((suggestion: any, index: number) => (
                <div key={index} className="space-y-1">
                  <label className="text-xs text-gray-600">{suggestion.question}</label>
                  <select
                    onChange={(e) => handleQuantificationSelect(e.target.value, suggestion.template)}
                    className="w-full p-2 border rounded text-sm"
                  >
                    <option value="">Select...</option>
                    {suggestion.options.map((option: string, optIndex: number) => (
                      <option key={optIndex} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* Alternatives */}
          {enhancement.alternatives.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Other options:</h4>
              <div className="space-y-1">
                {enhancement.alternatives.map((alt: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedQuantification(alt)}
                    className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border"
                  >
                    {alt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Improvement Score */}
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <div className="text-sm text-green-800">
              💪 Improvement Score: +{Math.round(enhancement.improvements.confidence * 100)} points!
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={handleAccept}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              ✓ Looks Great!
            </button>
            <button
              onClick={() => setEnhancement(null)}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              🔄 Try Different
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Example usage in your resume builder form
// components/ResumeBuilder.tsx
import React, { useState } from 'react';
import { EnhancementWidget } from './EnhancementWidget';

export const ResumeBuilder: React.FC = () => {
  const [workExperience, setWorkExperience] = useState([
    { id: 1, company: '', position: '', description: '', enhancedDescription: '' }
  ]);

  const handleDescriptionEnhancement = (index: number, enhancedText: string) => {
    const updated = [...workExperience];
    updated[index].enhancedDescription = enhancedText;
    setWorkExperience(updated);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Build Your Resume</h1>
      
      {workExperience.map((job, index) => (
        <div key={job.id} className="mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Company Name"
              value={job.company}
              onChange={(e) => {
                const updated = [...workExperience];
                updated[index].company = e.target.value;
                setWorkExperience(updated);
              }}
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Job Title"
              value={job.position}
              onChange={(e) => {
                const updated = [...workExperience];
                updated[index].position = e.target.value;
                setWorkExperience(updated);
              }}
              className="border rounded px-3 py-2"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Describe what you did (in your own words):
            </label>
            <textarea
              placeholder="I helped customers, managed inventory, worked with a team..."
              value={job.description}
              onChange={(e) => {
                const updated = [...workExperience];
                updated[index].description = e.target.value;
                setWorkExperience(updated);
              }}
              className="w-full border rounded px-3 py-2 h-24"
            />
          </div>

          {/* Enhancement Widget */}
          {job.description && (
            <EnhancementWidget
              initialText={job.description}
              industry="retail" // You'd get this from user selection
              roleLevel="entry" // You'd determine this from the position
              onAccept={(enhancedText) => handleDescriptionEnhancement(index, enhancedText)}
            />
          )}

          {/* Show final enhanced description */}
          {job.enhancedDescription && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Final version for your resume:</h4>
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                {job.enhancedDescription}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Quick implementation for parsing existing resumes
// lib/resume-parser/simple-parser.ts
export class SimpleResumeParser {
  
  static parseText(text: string): ParsedResume {
    const sections = this.identifySections(text);
    
    return {
      personalInfo: this.extractPersonalInfo(sections.header || ''),
      workExperience: this.extractWorkExperience(sections.experience || ''),
      education: this.extractEducation(sections.education || ''),
      skills: this.extractSkills(sections.skills || ''),
      confidence: 0.8 // Basic confidence score
    };
  }

  private static identifySections(text: string): any {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const sections: any = {};
    let currentSection = 'header';
    let currentContent: string[] = [];

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Detect section headers
      if (lowerLine.includes('experience') || lowerLine.includes('employment') || lowerLine.includes('work history')) {
        sections[currentSection] = currentContent.join('\n');
        currentSection = 'experience';
        currentContent = [];
      } else if (lowerLine.includes('education') || lowerLine.includes('academic')) {
        sections[currentSection] = currentContent.join('\n');
        currentSection = 'education';
        currentContent = [];
      } else if (lowerLine.includes('skill') || lowerLine.includes('competenc')) {
        sections[currentSection] = currentContent.join('\n');
        currentSection = 'skills';
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }
    
    sections[currentSection] = currentContent.join('\n');
    return sections;
  }

  private static extractPersonalInfo(headerText: string): any {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex = /(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/;
    
    const lines = headerText.split('\n').filter(Boolean);
    
    return {
      name: lines[0] || '',
      email: emailRegex.exec(headerText)?.[0] || '',
      phone: phoneRegex.exec(headerText)?.[0] || '',
      linkedin: this.extractLinkedIn(headerText),
      location: this.extractLocation(headerText)
    };
  }

  private static extractWorkExperience(experienceText: string): any[] {
    const experiences: any[] = [];
    const lines = experienceText.split('\n').filter(Boolean);
    
    let currentJob: any = {};
    
    for (const line of lines) {
      // Simple pattern matching for job entries
      if (this.looksLikeJobTitle(line)) {
        if (currentJob.title) {
          experiences.push(currentJob);
        }
        currentJob = { title: line, descriptions: [] };
      } else if (this.looksLikeCompany(line)) {
        currentJob.company = line;
      } else if (this.looksLikeDate(line)) {
        currentJob.dates = line;
      } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        currentJob.descriptions = currentJob.descriptions || [];
        currentJob.descriptions.push(line.replace(/^[•\-*]\s*/, ''));
      }
    }
    
    if (currentJob.title) {
      experiences.push(currentJob);
    }
    
    return experiences;
  }

  private static looksLikeJobTitle(line: string): boolean {
    const jobTitleWords = ['manager', 'assistant', 'associate', 'coordinator', 'specialist', 'representative', 'clerk', 'cashier', 'server'];
    return jobTitleWords.some(word => line.toLowerCase().includes(word));
  }

  private static looksLikeCompany(line: string): boolean {
    // Simple heuristic - look for Inc, LLC, Corp, etc.
    return /\b(inc|llc|corp|company|ltd|limited)\b/i.test(line);
  }

  private static looksLikeDate(line: string): boolean {
    return /\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(line);
  }

  private static extractEducation(educationText: string): any[] {
    // Basic education extraction
    const lines = educationText.split('\n').filter(Boolean);
    return lines.map(line => ({
      institution: line,
      degree: '',
      year: ''
    }));
  }

  private static extractSkills(skillsText: string): string[] {
    return skillsText.split(/[,\n•\-*]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
  }

  private static extractLinkedIn(text: string): string {
    const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9\-]+/;
    return linkedinRegex.exec(text)?.[0] || '';
  }

  private static extractLocation(text: string): string {
    // Simple city, state pattern
    const locationRegex = /[A-Z][a-z]+,\s*[A-Z]{2}/;
    return locationRegex.exec(text)?.[0] || '';
  }
}

interface ParsedResume {
  personalInfo: any;
  workExperience: any[];
  education: any[];
  skills: string[];
  confidence: number;
}