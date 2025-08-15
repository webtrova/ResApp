import { ResumeData, WorkExperience, Education, Skill } from '@/types/resume';

interface ParsingResult {
  sections: Record<string, { start: number; end: number; content: string }>;
  extractedData: ResumeData;
  confidence: number;
  suggestions: string[];
  rawText: string;
}

class EnhancedResumeParser {
  private static instance: EnhancedResumeParser;

  public static getInstance(): EnhancedResumeParser {
    if (!EnhancedResumeParser.instance) {
      EnhancedResumeParser.instance = new EnhancedResumeParser();
    }
    return EnhancedResumeParser.instance;
  }

  /**
   * Main parsing method that orchestrates the entire parsing process
   */
  async parseResume(text: string, fileType: string, fileName: string): Promise<ParsingResult> {
    try {
      // Step 1: Preprocess the text
      const preprocessedText = this.preprocessText(text);
      
      // Step 2: Detect sections using multiple strategies
      const sections = await this.detectSections(preprocessedText);
      
      // Step 3: Extract structured data from each section
      const extractedData = await this.extractStructuredData(sections, preprocessedText);
      
      // Step 4: Use AI to enhance and validate the extracted data
      const aiEnhancedData = await this.enhanceWithAI(preprocessedText, extractedData);
      
      // Step 5: Calculate confidence score
      const confidence = this.calculateConfidence(sections, aiEnhancedData);
      
      // Step 6: Generate suggestions for improvement
      const suggestions = this.generateSuggestions(aiEnhancedData, confidence);
      
      return {
        sections,
        extractedData: aiEnhancedData,
        confidence,
        suggestions,
        rawText: preprocessedText
      };
    } catch (error) {
      console.error('Error parsing resume:', error);
      return this.createFallbackResult(text);
    }
  }

  /**
   * Preprocess the text to improve parsing accuracy
   */
  private preprocessText(text: string): string {
    // Normalize line endings
    let processed = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Remove excessive whitespace while preserving structure
    processed = processed.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Clean up bullet points and formatting
    processed = processed.replace(/[•·▪▫◦‣⁃]/g, '•');
    
    // Normalize common section headers
    const headerMappings: Record<string, string> = {
      'personal information': 'PERSONAL INFORMATION',
      'contact information': 'CONTACT INFORMATION',
      'work experience': 'WORK EXPERIENCE',
      'employment history': 'EMPLOYMENT HISTORY',
      'professional experience': 'PROFESSIONAL EXPERIENCE',
      'education': 'EDUCATION',
      'academic background': 'ACADEMIC BACKGROUND',
      'skills': 'SKILLS',
      'technical skills': 'TECHNICAL SKILLS',
      'competencies': 'COMPETENCIES',
      'summary': 'SUMMARY',
      'objective': 'OBJECTIVE',
      'career objective': 'CAREER OBJECTIVE',
      'professional summary': 'PROFESSIONAL SUMMARY',
      'achievements': 'ACHIEVEMENTS',
      'accomplishments': 'ACCOMPLISHMENTS',
      'certifications': 'CERTIFICATIONS',
      'languages': 'LANGUAGES',
      'interests': 'INTERESTS',
      'volunteer': 'VOLUNTEER EXPERIENCE',
      'projects': 'PROJECTS',
      'publications': 'PUBLICATIONS',
      'awards': 'AWARDS',
      'honors': 'HONORS'
    };

    Object.entries(headerMappings).forEach(([oldHeader, newHeader]) => {
      const regex = new RegExp(`^\\s*${oldHeader}\\s*$`, 'gmi');
      processed = processed.replace(regex, newHeader);
    });

    return processed;
  }

  /**
   * Enhanced section detection with multiple strategies
   */
  private async detectSections(text: string): Promise<Record<string, { start: number; end: number; content: string }>> {
    const lines = text.split('\n');
    const sections: Record<string, { start: number; end: number; content: string }> = {};
    
    // More flexible section headers with variations
    const sectionPatterns = {
      'PERSONAL': /^(PERSONAL|CONTACT|PROFILE)\s*INFORMATION?$/i,
      'SUMMARY': /^(SUMMARY|OBJECTIVE|CAREER\s*OBJECTIVE|PROFESSIONAL\s*SUMMARY|PROFILE)$/i,
      'EXPERIENCE': /^(WORK\s*EXPERIENCE|EMPLOYMENT\s*HISTORY|PROFESSIONAL\s*EXPERIENCE|EXPERIENCE|EMPLOYMENT)$/i,
      'EDUCATION': /^(EDUCATION|ACADEMIC\s*BACKGROUND|ACADEMIC|DEGREES?)$/i,
      'SKILLS': /^(SKILLS?|TECHNICAL\s*SKILLS?|COMPETENCIES?|EXPERTISE|TECHNOLOGIES?)$/i,
      'PROJECTS': /^(PROJECTS?|PROJECT\s*EXPERIENCE|PORTFOLIO)$/i,
      'CERTIFICATIONS': /^(CERTIFICATIONS?|CERTIFICATES?|CERTIFICATE)$/i,
      'LANGUAGES': /^(LANGUAGES?|LANGUAGE\s*SKILLS?)$/i,
      'AWARDS': /^(AWARDS?|HONORS?|ACHIEVEMENTS?|ACCOMPLISHMENTS?)$/i,
      'VOLUNTEER': /^(VOLUNTEER|VOLUNTEER\s*EXPERIENCE)$/i
    };

    let currentSection = '';
    let sectionStart = 0;
    let sectionContent: string[] = [];
    let inSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this line is a section header
      let foundSection = '';
      for (const [sectionName, pattern] of Object.entries(sectionPatterns)) {
        if (pattern.test(line)) {
          foundSection = sectionName;
          break;
        }
      }

      // Also check for common variations without exact matches
      if (!foundSection) {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('experience') && !lowerLine.includes('education')) {
          foundSection = 'EXPERIENCE';
        } else if (lowerLine.includes('education') || lowerLine.includes('university') || lowerLine.includes('college')) {
          foundSection = 'EDUCATION';
        } else if (lowerLine.includes('skill') || lowerLine.includes('technology') || lowerLine.includes('expertise')) {
          foundSection = 'SKILLS';
        } else if (lowerLine.includes('summary') || lowerLine.includes('objective') || lowerLine.includes('profile')) {
          foundSection = 'SUMMARY';
        }
      }

      if (foundSection) {
        // Save previous section if exists
        if (currentSection && sectionContent.length > 0) {
          sections[currentSection] = {
            start: sectionStart,
            end: i - 1,
            content: sectionContent.join('\n').trim()
          };
        }
        
        // Start new section
        currentSection = foundSection;
        sectionStart = i;
        sectionContent = [];
        inSection = true;
      } else if (inSection && line) {
        // Add content to current section
        sectionContent.push(line);
      } else if (inSection && !line && sectionContent.length > 0) {
        // Empty line after content - still part of section
        sectionContent.push(line);
      } else if (inSection && !line && sectionContent.length === 0) {
        // Empty line at start of section - skip
        continue;
      }
    }

    // Save the last section
    if (currentSection && sectionContent.length > 0) {
      sections[currentSection] = {
        start: sectionStart,
        end: lines.length - 1,
        content: sectionContent.join('\n').trim()
      };
    }

    return sections;
  }

  /**
   * Extract structured data from detected sections
   */
  private async extractStructuredData(sections: Record<string, any>, fullText: string): Promise<ResumeData> {
    const resumeData: ResumeData = {
      personal: this.extractPersonalInfo(fullText, sections),
      summary: this.extractSummary(sections),
      experience: this.extractExperience(sections),
      education: this.extractEducation(sections),
      skills: this.extractSkills(sections)
    };

    return resumeData;
  }

  /**
   * Enhanced personal information extraction
   */
  private extractPersonalInfo(fullText: string, sections: Record<string, any>): ResumeData['personal'] {
    const personal: ResumeData['personal'] = {
      fullName: '',
      email: '',
      phone: '',
      linkedin: '',
      portfolio: '',
      location: ''
    };

    // Extract name using multiple strategies
    const lines = fullText.split('\n').slice(0, 15); // Check first 15 lines
    
    // Strategy 1: Look for name in first few lines (most common)
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.length > 3 && trimmedLine.length < 50) {
        // More flexible name pattern
        const namePattern = /^[A-Z][a-z]+(\s+[A-Z][a-z]+){1,3}$/;
        if (namePattern.test(trimmedLine) &&
            !trimmedLine.toLowerCase().includes('resume') &&
            !trimmedLine.includes('@') &&
            !trimmedLine.includes('phone') &&
            !trimmedLine.includes('email') &&
            !trimmedLine.includes('linkedin') &&
            !trimmedLine.includes('github') &&
            !trimmedLine.includes('portfolio')) {
          personal.fullName = trimmedLine;
          break;
        }
      }
    }

    // Strategy 2: If no name found, look for it in personal section
    if (!personal.fullName && sections.PERSONAL) {
      const personalLines = sections.PERSONAL.content.split('\n');
      for (const line of personalLines) {
        const trimmedLine = line.trim();
        const namePattern = /^[A-Z][a-z]+(\s+[A-Z][a-z]+){1,3}$/;
        if (namePattern.test(trimmedLine) && !trimmedLine.includes('@')) {
          personal.fullName = trimmedLine;
          break;
        }
      }
    }

    // Extract email with improved pattern
    const emailMatch = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      personal.email = emailMatch[0];
    }

    // Extract phone with multiple formats
    const phonePatterns = [
      /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
      /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/,
      /\(\d{3}\)\s?\d{3}[-.\s]?\d{4}/,
      /\d{10}/, // Just 10 digits
      /\d{3}\.\d{3}\.\d{4}/ // 123.456.7890 format
    ];
    
    for (const pattern of phonePatterns) {
      const phoneMatch = fullText.match(pattern);
      if (phoneMatch) {
        personal.phone = phoneMatch[0];
        break;
      }
    }

    // Extract LinkedIn with more flexible patterns
    const linkedinPatterns = [
      /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-_]+)/i,
      /linkedin\.com\/in\/([a-zA-Z0-9-_]+)/i,
      /linkedin\.com\/([a-zA-Z0-9-_]+)/i
    ];
    
    for (const pattern of linkedinPatterns) {
      const linkedinMatch = fullText.match(pattern);
      if (linkedinMatch) {
        personal.linkedin = linkedinMatch[0];
        break;
      }
    }

    // Extract portfolio/GitHub
    const portfolioPatterns = [
      /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-_]+)/i,
      /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+)\.com/i,
      /(?:https?:\/\/)?([a-zA-Z0-9-]+)\.(?:com|net|org|io)/i
    ];
    
    for (const pattern of portfolioPatterns) {
      const portfolioMatch = fullText.match(pattern);
      if (portfolioMatch && !portfolioMatch[0].includes('linkedin')) {
        personal.portfolio = portfolioMatch[0];
        break;
      }
    }

    // Extract location with more flexible patterns
    const locationPatterns = [
      /([A-Z][a-z]+,\s*[A-Z]{2})/,
      /([A-Z][a-z]+,\s*[A-Z][a-z]+)/,
      /([A-Z][a-z]+\s*[A-Z]{2})/,
      /([A-Z][a-z]+,\s*[A-Z][a-z]+,\s*[A-Z]{2})/,
      /([A-Z][a-z]+\s+[A-Z][a-z]+,\s*[A-Z]{2})/
    ];
    
    for (const pattern of locationPatterns) {
      const locationMatch = fullText.match(pattern);
      if (locationMatch) {
        personal.location = locationMatch[1];
        break;
      }
    }

    return personal;
  }

  /**
   * Extract summary information
   */
  private extractSummary(sections: Record<string, any>): ResumeData['summary'] {
    const summary: ResumeData['summary'] = {
      currentTitle: '',
      yearsExperience: 0,
      keySkills: [],
      careerObjective: ''
    };

    if (sections.SUMMARY) {
      const summaryText = sections.SUMMARY.content;
      summary.careerObjective = summaryText;

      // Extract current title from summary
      const titlePatterns = [
        /(?:senior|lead|principal|staff|junior|associate)?\s*(?:software\s+)?(?:engineer|developer|manager|analyst|consultant|specialist|coordinator|assistant|director|executive)/i,
        /(?:senior|lead|principal|staff|junior|associate)?\s*(?:product|project|program|business|data|marketing|sales|customer|operations|human\s+resources)\s+(?:manager|analyst|consultant|specialist|coordinator|assistant|director)/i
      ];

      for (const pattern of titlePatterns) {
        const match = summaryText.match(pattern);
        if (match) {
          summary.currentTitle = match[0];
          break;
        }
      }

      // Extract years of experience
      const experienceMatch = summaryText.match(/(\d+)\s*(?:years?|yrs?)\s*(?:of\s+)?experience/i);
      if (experienceMatch) {
        summary.yearsExperience = parseInt(experienceMatch[1]);
      }
    }

    return summary;
  }

  /**
   * Enhanced experience extraction
   */
  private extractExperience(sections: Record<string, any>): WorkExperience[] {
    const experiences: WorkExperience[] = [];
    
    if (sections.EXPERIENCE) {
      const experienceText = sections.EXPERIENCE.content;
      const lines = experienceText.split('\n');
      
      let currentExperience: Partial<WorkExperience> = {};
      let currentAchievements: string[] = [];
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines
        if (!trimmedLine) continue;
        
        // Multiple patterns for company/job title/date
        let companyTitleMatch = null;
        
        // Pattern 1: Company - Title - Date
        companyTitleMatch = trimmedLine.match(/^(.+?)\s*[-–—]\s*(.+?)\s*[-–—]\s*(.+)$/);
        
        // Pattern 2: Title at Company - Date
        if (!companyTitleMatch) {
          companyTitleMatch = trimmedLine.match(/^(.+?)\s+(?:at|@)\s+(.+?)\s*[-–—]\s*(.+)$/i);
          if (companyTitleMatch) {
            // Swap title and company
            const temp = companyTitleMatch[1];
            companyTitleMatch[1] = companyTitleMatch[2];
            companyTitleMatch[2] = temp;
          }
        }
        
        // Pattern 3: Just company and title (no date)
        if (!companyTitleMatch) {
          companyTitleMatch = trimmedLine.match(/^(.+?)\s*[-–—]\s*(.+)$/);
          if (companyTitleMatch) {
            companyTitleMatch[3] = ''; // No date
          }
        }
        
        // Pattern 4: Title, Company (comma separated)
        if (!companyTitleMatch) {
          companyTitleMatch = trimmedLine.match(/^(.+?),\s*(.+)$/);
          if (companyTitleMatch) {
            // Swap title and company
            const temp = companyTitleMatch[1];
            companyTitleMatch[1] = companyTitleMatch[2];
            companyTitleMatch[2] = temp;
            companyTitleMatch[3] = ''; // No date
          }
        }
        
        if (companyTitleMatch) {
          // Save previous experience if exists
          if (currentExperience.companyName && currentExperience.jobTitle) {
            experiences.push({
              ...currentExperience as WorkExperience,
              achievements: currentAchievements.length > 0 ? currentAchievements : ['Please add specific achievements']
            });
          }
          
          // Start new experience
          currentExperience = {
            companyName: companyTitleMatch[1].trim(),
            jobTitle: companyTitleMatch[2].trim(),
            startDate: companyTitleMatch[3] ? companyTitleMatch[3].trim() : '',
            jobDescription: ''
          };
          currentAchievements = [];
        } else if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
          // Achievement bullet point
          const achievement = trimmedLine.replace(/^[•\-*]\s*/, '').trim();
          if (achievement) {
            currentAchievements.push(achievement);
          }
        } else if (currentExperience.companyName && !currentExperience.jobDescription) {
          // Job description (first non-bullet line after title)
          currentExperience.jobDescription = trimmedLine;
        } else if (currentExperience.companyName && !currentExperience.startDate) {
          // Check if this line contains a date
          const datePatterns = [
            /\d{4}\s*[-–—]\s*(?:Present|Current|\d{4})/i,
            /\d{4}\s*[-–—]\s*(?:Present|Current)/i,
            /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\s*[-–—]\s*(?:Present|Current|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i,
            /\d{1,2}\/\d{4}\s*[-–—]\s*(?:Present|Current|\d{1,2}\/\d{4})/i
          ];
          
          for (const pattern of datePatterns) {
            if (pattern.test(trimmedLine)) {
              currentExperience.startDate = trimmedLine;
              break;
            }
          }
        }
      }
      
      // Add the last experience
      if (currentExperience.companyName && currentExperience.jobTitle) {
        experiences.push({
          ...currentExperience as WorkExperience,
          achievements: currentAchievements.length > 0 ? currentAchievements : ['Please add specific achievements']
        });
      }
    }

    return experiences;
  }

  /**
   * Enhanced education extraction
   */
  private extractEducation(sections: Record<string, any>): Education[] {
    const education: Education[] = [];
    
    if (sections.EDUCATION) {
      const educationText = sections.EDUCATION.content;
      const lines = educationText.split('\n');
      
      let currentEducation: Partial<Education> = {};
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (!trimmedLine) continue;
        
        // Check for institution/degree pattern
        const institutionDegreeMatch = trimmedLine.match(/^(.+?)\s*[-–—]\s*(.+?)\s*[-–—]\s*(.+)$/);
        if (institutionDegreeMatch) {
          // Save previous education if exists
          if (currentEducation.institution && currentEducation.degree) {
            education.push({
              ...currentEducation as Education,
              achievements: currentEducation.achievements || ['Education details extracted from resume']
            });
          }
          
          // Start new education
          currentEducation = {
            institution: institutionDegreeMatch[1].trim(),
            degree: institutionDegreeMatch[2].trim(),
            major: institutionDegreeMatch[3].trim(),
            graduationDate: '',
            achievements: []
          };
        } else if (trimmedLine.match(/^\d{4}$/) || trimmedLine.match(/^\d{4}-\d{4}$/)) {
          // Graduation date
          currentEducation.graduationDate = trimmedLine;
        } else if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
          // Achievement
          const achievement = trimmedLine.replace(/^[•\-]\s*/, '').trim();
          if (achievement) {
            currentEducation.achievements = currentEducation.achievements || [];
            currentEducation.achievements.push(achievement);
          }
        }
      }
      
      // Add the last education
      if (currentEducation.institution && currentEducation.degree) {
        education.push({
          ...currentEducation as Education,
          achievements: currentEducation.achievements || ['Education details extracted from resume']
        });
      }
    }

    return education;
  }

  /**
   * Enhanced skills extraction
   */
  private extractSkills(sections: Record<string, any>): Skill[] {
    const skills: Skill[] = [];
    
    if (sections.SKILLS) {
      const skillsText = sections.SKILLS.content;
      
      // Multiple strategies for skill extraction
      
      // Strategy 1: Comma-separated skills
      const commaSeparated = skillsText.match(/[^,\n]+(?:,\s*[^,\n]+)*/g);
      if (commaSeparated) {
        for (const skillGroup of commaSeparated) {
          const individualSkills = skillGroup.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
          for (const skill of individualSkills) {
            if (skill.length > 2 && skill.length < 50 && !skill.includes(':')) {
              skills.push({
                name: skill,
                category: this.categorizeSkill(skill),
                level: 'intermediate'
              });
            }
          }
        }
      }
      
      // Strategy 2: Bullet-pointed skills
      const bulletPoints = skillsText.match(/^[•\-*]\s*(.+)$/gm);
      if (bulletPoints) {
        for (const bullet of bulletPoints) {
          const skill = bullet.replace(/^[•\-*]\s*/, '').trim();
          if (skill.length > 2 && skill.length < 50) {
            skills.push({
              name: skill,
              category: this.categorizeSkill(skill),
              level: 'intermediate'
            });
          }
        }
      }
      
      // Strategy 3: Skills with levels (e.g., "JavaScript - Advanced")
      const skillWithLevels = skillsText.match(/([A-Za-z\s&+]+)\s*[-–—]\s*(beginner|intermediate|advanced|expert)/gi);
      if (skillWithLevels) {
        for (const skillLevel of skillWithLevels) {
          const match = skillLevel.match(/([A-Za-z\s&+]+)\s*[-–—]\s*(beginner|intermediate|advanced|expert)/i);
          if (match) {
            const skillName = match[1].trim();
            const level = match[2].toLowerCase() as 'beginner' | 'intermediate' | 'advanced' | 'expert';
            
            if (skillName.length > 2 && skillName.length < 50) {
              skills.push({
                name: skillName,
                category: this.categorizeSkill(skillName),
                level: level
              });
            }
          }
        }
      }
      
      // Strategy 4: Skills with categories (e.g., "Technical Skills: JavaScript, Python")
      const categoryPattern = /([A-Za-z\s]+):\s*([^:\n]+)/g;
      let categoryMatch;
      while ((categoryMatch = categoryPattern.exec(skillsText)) !== null) {
        const category = categoryMatch[1].trim();
        const skillList = categoryMatch[2];
        const individualSkills = skillList.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        
        for (const skill of individualSkills) {
          if (skill.length > 2 && skill.length < 50) {
            skills.push({
              name: skill,
              category: this.categorizeSkill(skill),
              level: 'intermediate'
            });
          }
        }
      }
      
      // Remove duplicates
      const uniqueSkills = skills.filter((skill, index, self) => 
        index === self.findIndex(s => s.name.toLowerCase() === skill.name.toLowerCase())
      );
      
      return uniqueSkills;
    }

    return skills;
  }

  /**
   * Categorize skills into technical, soft, or industry
   */
  private categorizeSkill(skillName: string): 'technical' | 'soft' | 'industry' {
    const technicalKeywords = [
      // Programming Languages
      'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala',
      // Web Technologies
      'react', 'vue', 'angular', 'node', 'express', 'django', 'flask', 'spring', 'laravel', 'asp.net',
      'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind', 'jquery', 'webpack', 'babel', 'vite',
      // Databases
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sqlite', 'dynamodb',
      // Cloud & DevOps
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github', 'bitbucket', 'terraform',
      // Data & AI
      'machine learning', 'ai', 'data analysis', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'scikit-learn',
      'tableau', 'power bi', 'excel', 'r', 'matlab', 'spark', 'hadoop', 'kafka',
      // Tools & Software
      'photoshop', 'illustrator', 'figma', 'sketch', 'invision', 'zeplin', 'jira', 'confluence', 'slack',
      'word', 'powerpoint', 'outlook', 'teams', 'zoom', 'trello', 'asana', 'notion',
      // Frameworks & Libraries
      'redux', 'mobx', 'graphql', 'rest', 'soap', 'grpc', 'socket.io', 'next.js', 'nuxt.js', 'gatsby',
      'jest', 'mocha', 'cypress', 'selenium', 'postman', 'insomnia'
    ];
    
    const softKeywords = [
      // Leadership & Management
      'leadership', 'management', 'team management', 'project management', 'people management',
      'mentoring', 'coaching', 'supervision', 'delegation', 'strategic planning',
      // Communication
      'communication', 'public speaking', 'presentation', 'writing', 'documentation',
      'interpersonal skills', 'client communication', 'stakeholder management',
      // Teamwork & Collaboration
      'teamwork', 'collaboration', 'cross-functional', 'remote work', 'virtual teams',
      'conflict resolution', 'negotiation', 'partnership', 'networking',
      // Problem Solving & Analysis
      'problem solving', 'critical thinking', 'analytical thinking', 'research', 'data analysis',
      'decision making', 'troubleshooting', 'root cause analysis', 'process improvement',
      // Organization & Planning
      'time management', 'organization', 'planning', 'prioritization', 'multitasking',
      'attention to detail', 'quality assurance', 'risk management',
      // Adaptability & Learning
      'adaptability', 'flexibility', 'learning', 'continuous improvement', 'innovation',
      'creativity', 'design thinking', 'agile', 'scrum', 'lean', 'six sigma',
      // Customer Focus
      'customer service', 'user experience', 'user research', 'customer satisfaction',
      'sales', 'marketing', 'business development'
    ];
    
    const lowerSkill = skillName.toLowerCase();
    
    if (technicalKeywords.some(keyword => lowerSkill.includes(keyword))) {
      return 'technical';
    } else if (softKeywords.some(keyword => lowerSkill.includes(keyword))) {
      return 'soft';
    } else {
      return 'industry';
    }
  }

  /**
   * Use AI to enhance extracted data
   */
  private async enhanceWithAI(fullText: string, extractedData: ResumeData): Promise<ResumeData> {
    // This would integrate with your AI service to enhance the extracted data
    // For now, return the extracted data as-is
    return extractedData;
  }

  /**
   * Calculate confidence score based on extraction quality
   */
  private calculateConfidence(sections: Record<string, any>, extractedData: ResumeData): number {
    let score = 0;
    let totalChecks = 0;

    // Check personal information
    if (extractedData.personal.fullName) score += 20;
    if (extractedData.personal.email) score += 15;
    if (extractedData.personal.phone) score += 15;
    totalChecks += 3;

    // Check experience
    if (extractedData.experience.length > 0) score += 20;
    if (extractedData.experience.some(exp => exp.achievements.length > 0)) score += 10;
    totalChecks += 2;

    // Check education
    if (extractedData.education.length > 0) score += 10;
    totalChecks += 1;

    // Check skills
    if (extractedData.skills.length > 0) score += 10;
    totalChecks += 1;

    return Math.min(100, Math.round((score / totalChecks) * 100));
  }

  /**
   * Generate suggestions for improvement
   */
  private generateSuggestions(extractedData: ResumeData, confidence: number): string[] {
    const suggestions: string[] = [];

    if (confidence < 70) {
      suggestions.push('Consider reviewing and manually editing the extracted information for better accuracy.');
    }

    if (!extractedData.personal.fullName) {
      suggestions.push('Please add your full name to the personal information section.');
    }

    if (!extractedData.personal.email) {
      suggestions.push('Please add your email address for contact information.');
    }

    if (extractedData.experience.length === 0) {
      suggestions.push('No work experience found. Please add your work history.');
    } else {
      extractedData.experience.forEach((exp, index) => {
        if (exp.achievements.length === 0 || exp.achievements[0] === 'Please add specific achievements') {
          suggestions.push(`Add specific achievements and responsibilities for your role at ${exp.companyName}.`);
        }
      });
    }

    if (extractedData.education.length === 0) {
      suggestions.push('No education information found. Please add your educational background.');
    }

    if (extractedData.skills.length === 0) {
      suggestions.push('No skills found. Please add your technical and soft skills.');
    }

    return suggestions;
  }

  /**
   * Create fallback result when parsing fails
   */
  private createFallbackResult(text: string): ParsingResult {
    return {
      sections: {},
      extractedData: {
        personal: { fullName: '', email: '', phone: '', linkedin: '', portfolio: '', location: '' },
        summary: { currentTitle: '', yearsExperience: 0, keySkills: [], careerObjective: '' },
        experience: [],
        education: [],
        skills: []
      },
      confidence: 0,
      suggestions: ['Unable to parse resume automatically. Please manually enter your information.'],
      rawText: text
    };
  }
}

export default EnhancedResumeParser;
