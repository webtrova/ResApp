import { aiServiceManager } from './ai-service-manager';

export interface AIParsingEnhancement {
  field: string;
  originalValue: string;
  enhancedValue: string;
  confidence: number;
  reasoning: string;
}

export interface AIParsingResult {
  enhancedData: any;
  enhancements: AIParsingEnhancement[];
  suggestions: string[];
  confidence: number;
}

class AIParsingService {
  private static instance: AIParsingService;

  public static getInstance(): AIParsingService {
    if (!AIParsingService.instance) {
      AIParsingService.instance = new AIParsingService();
    }
    return AIParsingService.instance;
  }

  /**
   * Use AI to enhance and validate parsed resume data
   */
  async enhanceParsedData(text: string, extractedData: any, fileType: string): Promise<AIParsingResult> {
    try {
      const enhancements: AIParsingEnhancement[] = [];
      const suggestions: string[] = [];
      let totalConfidence = 0;
      let enhancementCount = 0;

      // Enhance personal information
      if (extractedData.personal) {
        const personalEnhancements = await this.enhancePersonalInfo(text, extractedData.personal);
        enhancements.push(...personalEnhancements);
        totalConfidence += personalEnhancements.reduce((sum, e) => sum + e.confidence, 0);
        enhancementCount += personalEnhancements.length;
      }

      // Enhance work experience
      if (extractedData.experience && extractedData.experience.length > 0) {
        const experienceEnhancements = await this.enhanceWorkExperience(text, extractedData.experience);
        enhancements.push(...experienceEnhancements);
        totalConfidence += experienceEnhancements.reduce((sum, e) => sum + e.confidence, 0);
        enhancementCount += experienceEnhancements.length;
      }

      // Enhance education
      if (extractedData.education && extractedData.education.length > 0) {
        const educationEnhancements = await this.enhanceEducation(text, extractedData.education);
        enhancements.push(...educationEnhancements);
        totalConfidence += educationEnhancements.reduce((sum, e) => sum + e.confidence, 0);
        enhancementCount += educationEnhancements.length;
      }

      // Enhance skills
      if (extractedData.skills && extractedData.skills.length > 0) {
        const skillsEnhancements = await this.enhanceSkills(text, extractedData.skills);
        enhancements.push(...skillsEnhancements);
        totalConfidence += skillsEnhancements.reduce((sum, e) => sum + e.confidence, 0);
        enhancementCount += skillsEnhancements.length;
      }

      // Generate overall suggestions
      const overallSuggestions = await this.generateOverallSuggestions(text, extractedData, enhancements);
      suggestions.push(...overallSuggestions);

      // Apply enhancements to the data
      const enhancedData = this.applyEnhancements(extractedData, enhancements);

      const confidence = enhancementCount > 0 ? totalConfidence / enhancementCount : 0.5;

      return {
        enhancedData,
        enhancements,
        suggestions,
        confidence
      };
    } catch (error) {
      console.error('AI parsing enhancement failed:', error);
      return {
        enhancedData: extractedData,
        enhancements: [],
        suggestions: ['AI enhancement failed. Please review the extracted data manually.'],
        confidence: 0.3
      };
    }
  }

  /**
   * Enhance personal information using AI
   */
  private async enhancePersonalInfo(text: string, personal: any): Promise<AIParsingEnhancement[]> {
    const enhancements: AIParsingEnhancement[] = [];

    try {
      const prompt = `
Analyze this resume text and extract/validate personal information:

RESUME TEXT:
${text.substring(0, 2000)}

CURRENT EXTRACTED PERSONAL INFO:
${JSON.stringify(personal, null, 2)}

Please provide:
1. Full name (if missing or unclear)
2. Email address (if missing or invalid)
3. Phone number (if missing or needs formatting)
4. Location (if missing)
5. LinkedIn profile (if missing or needs formatting)
6. Portfolio/website (if missing)

For each field, provide:
- The corrected/enhanced value
- Confidence level (0-1)
- Brief reasoning

Respond in JSON format:
{
  "name": {"value": "corrected name", "confidence": 0.9, "reasoning": "found in first line"},
  "email": {"value": "corrected email", "confidence": 0.8, "reasoning": "valid email format"},
  ...
}
`;

      const response = await aiServiceManager.enhanceText(prompt, 'personal_info_extraction');
      
      if (response) {
        try {
          const aiResult = JSON.parse(response);
          
          // Process name enhancement
          if (aiResult.name && aiResult.name.value && aiResult.name.confidence > 0.7) {
            if (aiResult.name.value !== personal.fullName) {
              enhancements.push({
                field: 'personal.fullName',
                originalValue: personal.fullName,
                enhancedValue: aiResult.name.value,
                confidence: aiResult.name.confidence,
                reasoning: aiResult.name.reasoning
              });
            }
          }

          // Process email enhancement
          if (aiResult.email && aiResult.email.value && aiResult.email.confidence > 0.7) {
            if (aiResult.email.value !== personal.email) {
              enhancements.push({
                field: 'personal.email',
                originalValue: personal.email,
                enhancedValue: aiResult.email.value,
                confidence: aiResult.email.confidence,
                reasoning: aiResult.email.reasoning
              });
            }
          }

          // Process phone enhancement
          if (aiResult.phone && aiResult.phone.value && aiResult.phone.confidence > 0.7) {
            if (aiResult.phone.value !== personal.phone) {
              enhancements.push({
                field: 'personal.phone',
                originalValue: personal.phone,
                enhancedValue: aiResult.phone.value,
                confidence: aiResult.phone.confidence,
                reasoning: aiResult.phone.reasoning
              });
            }
          }

          // Process location enhancement
          if (aiResult.location && aiResult.location.value && aiResult.location.confidence > 0.7) {
            if (aiResult.location.value !== personal.location) {
              enhancements.push({
                field: 'personal.location',
                originalValue: personal.location,
                enhancedValue: aiResult.location.value,
                confidence: aiResult.location.confidence,
                reasoning: aiResult.location.reasoning
              });
            }
          }

          // Process LinkedIn enhancement
          if (aiResult.linkedin && aiResult.linkedin.value && aiResult.linkedin.confidence > 0.7) {
            if (aiResult.linkedin.value !== personal.linkedin) {
              enhancements.push({
                field: 'personal.linkedin',
                originalValue: personal.linkedin,
                enhancedValue: aiResult.linkedin.value,
                confidence: aiResult.linkedin.confidence,
                reasoning: aiResult.linkedin.reasoning
              });
            }
          }

        } catch (parseError) {
          console.error('Failed to parse AI response for personal info:', parseError);
        }
      }
    } catch (error) {
      console.error('AI personal info enhancement failed:', error);
    }

    return enhancements;
  }

  /**
   * Enhance work experience using AI
   */
  private async enhanceWorkExperience(text: string, experience: any[]): Promise<AIParsingEnhancement[]> {
    const enhancements: AIParsingEnhancement[] = [];

    try {
      for (let i = 0; i < experience.length; i++) {
        const exp = experience[i];
        
        const prompt = `
Analyze this work experience entry from a resume and enhance it:

RESUME TEXT:
${text.substring(0, 2000)}

CURRENT EXPERIENCE ENTRY:
${JSON.stringify(exp, null, 2)}

Please provide:
1. Company name (if missing or unclear)
2. Job title (if missing or needs improvement)
3. Employment dates (if missing or needs formatting)
4. Job description (if missing or needs enhancement)
5. Achievements (if missing or needs improvement)

For each field, provide:
- The corrected/enhanced value
- Confidence level (0-1)
- Brief reasoning

Respond in JSON format:
{
  "company": {"value": "corrected company", "confidence": 0.9, "reasoning": "found in text"},
  "title": {"value": "corrected title", "confidence": 0.8, "reasoning": "standardized format"},
  "dates": {"value": "corrected dates", "confidence": 0.7, "reasoning": "parsed from text"},
  "description": {"value": "enhanced description", "confidence": 0.6, "reasoning": "AI generated"},
  "achievements": {"value": ["achievement1", "achievement2"], "confidence": 0.7, "reasoning": "extracted from bullet points"}
}
`;

        const response = await aiServiceManager.enhanceText(prompt, 'work_experience_enhancement');
        
        if (response) {
          try {
            const aiResult = JSON.parse(response);
            
            // Process company enhancement
            if (aiResult.company && aiResult.company.value && aiResult.company.confidence > 0.7) {
              if (aiResult.company.value !== exp.companyName) {
                enhancements.push({
                  field: `experience[${i}].companyName`,
                  originalValue: exp.companyName,
                  enhancedValue: aiResult.company.value,
                  confidence: aiResult.company.confidence,
                  reasoning: aiResult.company.reasoning
                });
              }
            }

            // Process job title enhancement
            if (aiResult.title && aiResult.title.value && aiResult.title.confidence > 0.7) {
              if (aiResult.title.value !== exp.jobTitle) {
                enhancements.push({
                  field: `experience[${i}].jobTitle`,
                  originalValue: exp.jobTitle,
                  enhancedValue: aiResult.title.value,
                  confidence: aiResult.title.confidence,
                  reasoning: aiResult.title.reasoning
                });
              }
            }

            // Process dates enhancement
            if (aiResult.dates && aiResult.dates.value && aiResult.dates.confidence > 0.7) {
              if (aiResult.dates.value !== exp.startDate) {
                enhancements.push({
                  field: `experience[${i}].startDate`,
                  originalValue: exp.startDate,
                  enhancedValue: aiResult.dates.value,
                  confidence: aiResult.dates.confidence,
                  reasoning: aiResult.dates.reasoning
                });
              }
            }

            // Process description enhancement
            if (aiResult.description && aiResult.description.value && aiResult.description.confidence > 0.6) {
              if (aiResult.description.value !== exp.jobDescription) {
                enhancements.push({
                  field: `experience[${i}].jobDescription`,
                  originalValue: exp.jobDescription,
                  enhancedValue: aiResult.description.value,
                  confidence: aiResult.description.confidence,
                  reasoning: aiResult.description.reasoning
                });
              }
            }

            // Process achievements enhancement
            if (aiResult.achievements && aiResult.achievements.value && aiResult.achievements.confidence > 0.6) {
              const originalAchievements = exp.achievements?.join(', ') || '';
              const enhancedAchievements = Array.isArray(aiResult.achievements.value) 
                ? aiResult.achievements.value.join(', ')
                : aiResult.achievements.value;
              
              if (enhancedAchievements !== originalAchievements) {
                enhancements.push({
                  field: `experience[${i}].achievements`,
                  originalValue: originalAchievements,
                  enhancedValue: enhancedAchievements,
                  confidence: aiResult.achievements.confidence,
                  reasoning: aiResult.achievements.reasoning
                });
              }
            }

          } catch (parseError) {
            console.error(`Failed to parse AI response for experience ${i}:`, parseError);
          }
        }
      }
    } catch (error) {
      console.error('AI work experience enhancement failed:', error);
    }

    return enhancements;
  }

  /**
   * Enhance education using AI
   */
  private async enhanceEducation(text: string, education: any[]): Promise<AIParsingEnhancement[]> {
    const enhancements: AIParsingEnhancement[] = [];

    try {
      for (let i = 0; i < education.length; i++) {
        const edu = education[i];
        
        const prompt = `
Analyze this education entry from a resume and enhance it:

RESUME TEXT:
${text.substring(0, 2000)}

CURRENT EDUCATION ENTRY:
${JSON.stringify(edu, null, 2)}

Please provide:
1. Institution name (if missing or unclear)
2. Degree type (if missing or needs clarification)
3. Major/field of study (if missing)
4. Graduation date (if missing or needs formatting)
5. GPA (if mentioned)

For each field, provide:
- The corrected/enhanced value
- Confidence level (0-1)
- Brief reasoning

Respond in JSON format:
{
  "institution": {"value": "corrected institution", "confidence": 0.9, "reasoning": "found in text"},
  "degree": {"value": "corrected degree", "confidence": 0.8, "reasoning": "standardized format"},
  "major": {"value": "corrected major", "confidence": 0.7, "reasoning": "extracted from text"},
  "graduationDate": {"value": "corrected date", "confidence": 0.7, "reasoning": "parsed from text"},
  "gpa": {"value": "gpa if found", "confidence": 0.6, "reasoning": "extracted if mentioned"}
}
`;

        const response = await aiServiceManager.enhanceText(prompt, 'education_enhancement');
        
        if (response) {
          try {
            const aiResult = JSON.parse(response);
            
            // Process institution enhancement
            if (aiResult.institution && aiResult.institution.value && aiResult.institution.confidence > 0.7) {
              if (aiResult.institution.value !== edu.institution) {
                enhancements.push({
                  field: `education[${i}].institution`,
                  originalValue: edu.institution,
                  enhancedValue: aiResult.institution.value,
                  confidence: aiResult.institution.confidence,
                  reasoning: aiResult.institution.reasoning
                });
              }
            }

            // Process degree enhancement
            if (aiResult.degree && aiResult.degree.value && aiResult.degree.confidence > 0.7) {
              if (aiResult.degree.value !== edu.degree) {
                enhancements.push({
                  field: `education[${i}].degree`,
                  originalValue: edu.degree,
                  enhancedValue: aiResult.degree.value,
                  confidence: aiResult.degree.confidence,
                  reasoning: aiResult.degree.reasoning
                });
              }
            }

            // Process major enhancement
            if (aiResult.major && aiResult.major.value && aiResult.major.confidence > 0.6) {
              if (aiResult.major.value !== edu.major) {
                enhancements.push({
                  field: `education[${i}].major`,
                  originalValue: edu.major,
                  enhancedValue: aiResult.major.value,
                  confidence: aiResult.major.confidence,
                  reasoning: aiResult.major.reasoning
                });
              }
            }

            // Process graduation date enhancement
            if (aiResult.graduationDate && aiResult.graduationDate.value && aiResult.graduationDate.confidence > 0.7) {
              if (aiResult.graduationDate.value !== edu.graduationDate) {
                enhancements.push({
                  field: `education[${i}].graduationDate`,
                  originalValue: edu.graduationDate,
                  enhancedValue: aiResult.graduationDate.value,
                  confidence: aiResult.graduationDate.confidence,
                  reasoning: aiResult.graduationDate.reasoning
                });
              }
            }

          } catch (parseError) {
            console.error(`Failed to parse AI response for education ${i}:`, parseError);
          }
        }
      }
    } catch (error) {
      console.error('AI education enhancement failed:', error);
    }

    return enhancements;
  }

  /**
   * Enhance skills using AI
   */
  private async enhanceSkills(text: string, skills: any[]): Promise<AIParsingEnhancement[]> {
    const enhancements: AIParsingEnhancement[] = [];

    try {
      const prompt = `
Analyze this resume text and extract/enhance skills:

RESUME TEXT:
${text.substring(0, 2000)}

CURRENT EXTRACTED SKILLS:
${JSON.stringify(skills, null, 2)}

Please provide:
1. Technical skills (programming languages, tools, technologies)
2. Soft skills (leadership, communication, etc.)
3. Industry-specific skills
4. Skill levels (beginner, intermediate, advanced) where appropriate

For each skill category, provide:
- List of skills
- Confidence level (0-1)
- Brief reasoning

Respond in JSON format:
{
  "technical": {"value": ["skill1", "skill2"], "confidence": 0.8, "reasoning": "found in text"},
  "soft": {"value": ["skill1", "skill2"], "confidence": 0.7, "reasoning": "inferred from context"},
  "industry": {"value": ["skill1", "skill2"], "confidence": 0.6, "reasoning": "industry-specific terms"}
}
`;

      const response = await aiServiceManager.enhanceText(prompt, 'skills_enhancement');
      
      if (response) {
        try {
          const aiResult = JSON.parse(response);
          
          // Process technical skills enhancement
          if (aiResult.technical && aiResult.technical.value && aiResult.technical.confidence > 0.6) {
            const originalSkills = skills.map(s => s.name).join(', ');
            const enhancedSkills = Array.isArray(aiResult.technical.value) 
              ? aiResult.technical.value.join(', ')
              : aiResult.technical.value;
            
            if (enhancedSkills !== originalSkills) {
              enhancements.push({
                field: 'skills',
                originalValue: originalSkills,
                enhancedValue: enhancedSkills,
                confidence: aiResult.technical.confidence,
                reasoning: aiResult.technical.reasoning
              });
            }
          }

        } catch (parseError) {
          console.error('Failed to parse AI response for skills:', parseError);
        }
      }
    } catch (error) {
      console.error('AI skills enhancement failed:', error);
    }

    return enhancements;
  }

  /**
   * Generate overall suggestions for the resume
   */
  private async generateOverallSuggestions(text: string, extractedData: any, enhancements: AIParsingEnhancement[]): Promise<string[]> {
    const suggestions: string[] = [];

    try {
      const prompt = `
Analyze this resume parsing result and provide suggestions for improvement:

RESUME TEXT (first 2000 chars):
${text.substring(0, 2000)}

EXTRACTED DATA:
${JSON.stringify(extractedData, null, 2)}

ENHANCEMENTS MADE:
${JSON.stringify(enhancements, null, 2)}

Please provide 3-5 specific suggestions for:
1. Missing information that should be added
2. Data quality issues that need attention
3. Formatting or structure improvements
4. Content enhancements

Respond with a simple list of suggestions, one per line.
`;

      const response = await aiServiceManager.enhanceText(prompt, 'resume_suggestions');
      
      if (response) {
        const lines = response.split('\n').filter((line: string) => line.trim());
        suggestions.push(...lines.slice(0, 5)); // Limit to 5 suggestions
      }
    } catch (error) {
      console.error('AI suggestions generation failed:', error);
    }

    // Add fallback suggestions based on data analysis
    if (!extractedData.personal?.fullName) {
      suggestions.push('Full name is missing. Please add your complete name.');
    }

    if (!extractedData.personal?.email) {
      suggestions.push('Email address is missing. Please add your email for contact purposes.');
    }

    if (!extractedData.experience || extractedData.experience.length === 0) {
      suggestions.push('No work experience found. Please add your professional work history.');
    }

    if (!extractedData.education || extractedData.education.length === 0) {
      suggestions.push('No education information found. Please add your educational background.');
    }

    return suggestions.slice(0, 5); // Limit to 5 suggestions total
  }

  /**
   * Apply enhancements to the extracted data
   */
  private applyEnhancements(extractedData: any, enhancements: AIParsingEnhancement[]): any {
    const enhancedData = JSON.parse(JSON.stringify(extractedData)); // Deep clone

    for (const enhancement of enhancements) {
      if (enhancement.confidence > 0.6) { // Only apply high-confidence enhancements
        const fieldPath = enhancement.field.split('.');
        let current = enhancedData;
        
        // Navigate to the field location
        for (let i = 0; i < fieldPath.length - 1; i++) {
          const path = fieldPath[i];
          
          // Handle array indices
          if (path.includes('[') && path.includes(']')) {
            const arrayName = path.substring(0, path.indexOf('['));
            const index = parseInt(path.substring(path.indexOf('[') + 1, path.indexOf(']')));
            current = current[arrayName][index];
          } else {
            current = current[path];
          }
        }
        
        // Set the enhanced value
        const lastField = fieldPath[fieldPath.length - 1];
        if (lastField.includes('[') && lastField.includes(']')) {
          const arrayName = lastField.substring(0, lastField.indexOf('['));
          const index = parseInt(lastField.substring(lastField.indexOf('[') + 1, lastField.indexOf(']')));
          current[arrayName][index] = enhancement.enhancedValue;
        } else {
          current[lastField] = enhancement.enhancedValue;
        }
      }
    }

    return enhancedData;
  }
}

export default AIParsingService;
