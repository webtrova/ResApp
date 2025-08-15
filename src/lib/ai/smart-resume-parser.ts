import { ResumeData, WorkExperience, Education, Skill } from '@/types/resume';

export class SmartResumeParser {
  private static instance: SmartResumeParser;
  
  public static getInstance(): SmartResumeParser {
    if (!SmartResumeParser.instance) {
      SmartResumeParser.instance = new SmartResumeParser();
    }
    return SmartResumeParser.instance;
  }

  public async parseResume(text: string): Promise<{
    extractedData: ResumeData;
    confidence: number;
    suggestions: string[];
  }> {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const sections = this.identifySections(text);
    
    console.log('📊 Smart parser sections identified:', Object.keys(sections));
    
    const extractedData: ResumeData = {
      personal: this.extractPersonalInfo(text, lines),
      summary: this.extractSummary(text, sections),
      experience: this.extractExperience(text, sections),
      education: this.extractEducation(text, sections),
      skills: this.extractSkills(text, sections)
    };

    const suggestions = this.generateSuggestions(extractedData, text);
    const confidence = this.calculateConfidence(extractedData, text);

    return {
      extractedData,
      confidence,
      suggestions
    };
  }

  private identifySections(text: string): Record<string, { start: number; end: number; content: string }> {
    const sections: Record<string, { start: number; end: number; content: string }> = {};
    const lines = text.split('\n');
    
    // Common section headers
    const sectionKeywords = {
      objective: /^(objective|summary|profile|about|career\s+objective|professional\s+summary)\s*$/i,
      experience: /^(experience|employment|work\s+history|professional\s+experience|career\s+history)\s*$/i,
      education: /^(education|academic|academic\s+background|qualifications)\s*$/i,
      skills: /^(skills|technical\s+skills|core\s+competencies|competencies|abilities)\s*$/i,
      contact: /^(contact|contact\s+information|personal\s+information)\s*$/i
    };

    let currentSection = '';
    let sectionStart = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this line is a section header
      for (const [sectionName, pattern] of Object.entries(sectionKeywords)) {
        if (pattern.test(line)) {
          // Save previous section if exists
          if (currentSection && sectionStart < i) {
            sections[currentSection] = {
              start: sectionStart,
              end: i - 1,
              content: lines.slice(sectionStart, i).join('\n')
            };
          }
          
          currentSection = sectionName;
          sectionStart = i + 1;
          break;
        }
      }
    }

    // Save the last section
    if (currentSection && sectionStart < lines.length) {
      sections[currentSection] = {
        start: sectionStart,
        end: lines.length - 1,
        content: lines.slice(sectionStart).join('\n')
      };
    }

    return sections;
  }

  private extractPersonalInfo(text: string, lines: string[]): {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    portfolio: string;
    location: string;
  } {
    const personal = {
      fullName: '',
      email: '',
      phone: '',
      linkedin: '',
      portfolio: '',
      location: ''
    };

    // Extract name from first few lines, but be more selective
    for (let i = 0; i < Math.min(lines.length, 3); i++) {
      const line = lines[i].trim();
      
      // Must be a proper name: 2-4 words, starts with capital, no special chars except spaces/hyphens
      if (this.isValidName(line)) {
        personal.fullName = line;
        break;
      }
    }

    // Extract email with better validation
    const emailMatch = text.match(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/);
    if (emailMatch) {
      personal.email = emailMatch[0];
    }

    // Extract phone with better patterns
    const phonePatterns = [
      /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/,
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/,
      /\(\d{3}\)\s?\d{3}[-.\s]?\d{4}\b/
    ];
    
    for (const pattern of phonePatterns) {
      const phoneMatch = text.match(pattern);
      if (phoneMatch) {
        personal.phone = phoneMatch[0].trim();
        break;
      }
    }

    // Extract LinkedIn
    const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-_]+)/i);
    if (linkedinMatch) {
      personal.linkedin = `https://linkedin.com/in/${linkedinMatch[1]}`;
    }

    // Extract location - look for address patterns
    const locationPatterns = [
      /\b\d+\s+[A-Z][a-z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd),?\s+[A-Z][a-z]+,?\s+[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/i,
      /\b[A-Z][a-z]+,\s+[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/,
      /\b[A-Z][a-z]+,\s+[A-Z][a-z]+,?\s+\d{5}(?:-\d{4})?\b/
    ];
    
    for (const pattern of locationPatterns) {
      const locationMatch = text.match(pattern);
      if (locationMatch && !locationMatch[0].toLowerCase().includes('inc') && !locationMatch[0].toLowerCase().includes('plan')) {
        personal.location = locationMatch[0];
        break;
      }
    }

    return personal;
  }

  private isValidName(text: string): boolean {
    // Must be 2-4 words
    const words = text.split(/\s+/);
    if (words.length < 2 || words.length > 4) return false;
    
    // Each word should start with capital letter
    if (!words.every(word => /^[A-Z][a-z]+$/.test(word))) return false;
    
    // Shouldn't contain common non-name words
    const nonNameWords = ['resume', 'cv', 'curriculum', 'vitae', 'objective', 'experience', 'education', 'skills', 'contact', 'phone', 'email'];
    if (words.some(word => nonNameWords.includes(word.toLowerCase()))) return false;
    
    // Total length check
    if (text.length < 4 || text.length > 50) return false;
    
    return true;
  }

  private extractSummary(text: string, sections: Record<string, any>): {
    currentTitle: string;
    yearsExperience: number;
    keySkills: string[];
    careerObjective: string;
  } {
    const summary = {
      currentTitle: '',
      yearsExperience: 0,
      keySkills: [],
      careerObjective: ''
    };

    // Get objective/summary from identified sections
    if (sections.objective) {
      summary.careerObjective = sections.objective.content.trim();
    }

    // Extract current title from objective or first experience
    const titlePatterns = [
      /(?:current|experienced|seeking)\s+([\w\s]+?)(?:\s+with|\s+looking|\s+that|\.|$)/i,
      /\b(senior|junior|lead|principal|staff)?\s*(software engineer|developer|programmer|analyst|manager|director|consultant|designer|architect|cook|server|cashier|assistant|coordinator|specialist|administrator|technician|representative|sales associate|crew member|intern)\b/i
    ];
    
    for (const pattern of titlePatterns) {
      const titleMatch = text.match(pattern);
      if (titleMatch) {
        summary.currentTitle = (titleMatch[1] || titleMatch[0]).trim();
        break;
      }
    }

    // Extract years of experience
    const experienceMatch = text.match(/(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?experience/i);
    if (experienceMatch) {
      summary.yearsExperience = parseInt(experienceMatch[1]);
    }

    return summary;
  }

  private extractExperience(text: string, sections: Record<string, any>): WorkExperience[] {
    const experiences: WorkExperience[] = [];
    
    // Use experience section if available, otherwise scan whole text
    const experienceText = sections.experience?.content || text;
    const lines = experienceText.split('\n').map((line: string) => line.trim()).filter(Boolean);

    let currentExperience: Partial<WorkExperience> | null = null;
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      
      // Try to parse date range pattern
      const dateMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4})\s*[-–—]\s*(current|present|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4})/i);
      
      if (dateMatch) {
        // This line contains dates, next line might have job title and company
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          const jobCompanyMatch = nextLine.match(/^(.+?)\s*[•·]\s*(.+)$/);
          
          if (jobCompanyMatch) {
            // Save previous experience if exists
            if (currentExperience && this.isValidExperience(currentExperience)) {
              experiences.push(currentExperience as WorkExperience);
            }
            
            currentExperience = {
              jobTitle: jobCompanyMatch[1].trim(),
              companyName: jobCompanyMatch[2].trim(),
              startDate: dateMatch[1],
              endDate: dateMatch[2].toLowerCase() === 'current' || dateMatch[2].toLowerCase() === 'present' ? 'Present' : dateMatch[2],
              jobDescription: '',
              achievements: []
            };
            
            i += 2; // Skip both date and job/company lines
            continue;
          }
        }
      }
      
      // If we're in an experience, collect achievements/responsibilities
      if (currentExperience && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || 
          /^(responsible for|managed|led|developed|created|implemented|achieved|increased|decreased|improved|assisted|provided|worked|used|cleaned|organized|certified|operates|safely)/i.test(line))) {
        const achievement = line.replace(/^[•\-*]\s*/, '').trim();
        if (achievement && achievement.length > 10) { // Avoid very short achievements
          currentExperience.achievements = currentExperience.achievements || [];
          currentExperience.achievements.push(achievement);
        }
      }
      
      i++;
    }

    // Add the last experience if valid
    if (currentExperience && this.isValidExperience(currentExperience)) {
      experiences.push(currentExperience as WorkExperience);
    }

    // Fill in missing descriptions
    return experiences.map(exp => ({
      ...exp,
      jobDescription: exp.jobDescription || (exp.achievements && exp.achievements.length > 0 ? exp.achievements[0] : 'Please add job description'),
      achievements: exp.achievements && exp.achievements.length > 0 ? exp.achievements : ['Please add specific achievements and responsibilities']
    }));
  }

  private isValidExperience(exp: Partial<WorkExperience>): boolean {
    return !!(exp.jobTitle && exp.companyName && exp.jobTitle.length > 2 && exp.companyName.length > 2);
  }

  private extractEducation(text: string, sections: Record<string, any>): Education[] {
    const education: Education[] = [];
    
    // Use education section if available
    const educationText = sections.education?.content || text;
    
    // Look for university/college patterns
    const institutionPatterns = [
      /\b([A-Z][a-zA-Z\s]+(?:University|College|Institute|School|Academy))\b/g,
      /\b(University of [A-Z][a-zA-Z\s]+)\b/g,
      /\b([A-Z][a-zA-Z\s]+State University)\b/g
    ];
    
    const degreePatterns = [
      /\b(Bachelor(?:'?s)?|Master(?:'?s)?|PhD|Ph\.D|Associate|Diploma)\s*(?:of\s+|in\s+|degree\s+in\s+)?([A-Z][a-zA-Z\s]+)/i,
      /\b(B\.?A\.?|B\.?S\.?|M\.?A\.?|M\.?S\.?|M\.?B\.?A\.?)\s*(?:in\s+)?([A-Z][a-zA-Z\s]+)?/i
    ];
    
    // Find institutions and track to avoid duplicates
    const foundInstitutions = new Set();
    
    for (const pattern of institutionPatterns) {
      let match;
      while ((match = pattern.exec(educationText)) !== null) {
        const institution = match[1].trim();
        
        // Avoid false positives and duplicates
        if (!this.isValidInstitution(institution) || foundInstitutions.has(institution.toLowerCase())) continue;
        
        foundInstitutions.add(institution.toLowerCase());
        
        // Look for degree and year near this institution
        const contextStart = Math.max(0, match.index - 200);
        const contextEnd = Math.min(educationText.length, match.index + 200);
        const context = educationText.substring(contextStart, contextEnd);
        
        let degree = '';
        let major = '';
        let graduationDate = '';
        
        // Look for degree
        for (const degreePattern of degreePatterns) {
          const degreeMatch = context.match(degreePattern);
          if (degreeMatch) {
            degree = degreeMatch[1];
            major = degreeMatch[2] || '';
            break;
          }
        }
        
        // Look for graduation year
        const yearMatch = context.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) {
          graduationDate = yearMatch[0];
        }
        
        education.push({
          institution,
          degree: degree || 'Degree to be specified',
          major: major || 'Field of study to be specified',
          graduationDate,
          achievements: ['Please add relevant coursework, honors, or achievements']
        });
      }
    }
    
    return education;
  }

  private isValidInstitution(name: string): boolean {
    // Avoid false positives
    const invalidWords = ['current', 'college student', 'experience', 'just', 'american multi-cinema'];
    return !invalidWords.some(word => name.toLowerCase().includes(word));
  }

  private extractSkills(text: string, sections: Record<string, any>): Skill[] {
    const skills: Skill[] = [];
    
    // Use skills section if available, otherwise scan whole text
    const skillsText = sections.skills?.content || text;
    
    // Predefined skill categories with more precise matching
    const skillCategories = {
      technical: [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
        'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Django', 'Flask', 'Laravel', 'Spring', 'ASP.NET',
        'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQLite',
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab', 'GitHub',
        'Git', 'HTML', 'CSS', 'Sass', 'Webpack', 'npm', 'yarn'
      ],
      soft: [
        'Leadership', 'Communication', 'Problem Solving', 'Team Management', 'Project Management',
        'Customer Service', 'Teamwork', 'Time Management', 'Organization', 'Attention to Detail',
        'Adaptability', 'Critical Thinking', 'Creativity', 'Collaboration'
      ],
      industry: [
        'Food Safety', 'Kitchen Operations', 'ServSafe', 'POS Systems', 'Inventory Management',
        'Sales', 'Retail', 'Cash Handling', 'Visual Merchandising', 'Stock Management'
      ]
    };

    // Extract explicitly mentioned skills from skills section
    if (sections.skills) {
      const skillsLine = sections.skills.content.toLowerCase();
      const mentionedSkills = skillsLine.split(/[,;\n]/).map((s: string) => s.trim()).filter((s: string) => s.length > 2);
      
      mentionedSkills.forEach((skill: string) => {
        const cleanSkill = skill.replace(/[^\w\s]/g, '').trim();
        // Filter out address parts, emails, phone numbers, and other non-skills
        if (cleanSkill.length > 2 && 
            !this.isAddressPart(cleanSkill) && 
            !this.isContactInfo(cleanSkill) &&
            this.isValidSkill(cleanSkill)) {
          skills.push({
            name: this.capitalizeWords(cleanSkill),
            category: 'soft',
            level: 'intermediate'
          });
        }
      });
    }

    // Find technical and industry skills with context awareness
    for (const [category, skillList] of Object.entries(skillCategories)) {
      for (const skill of skillList) {
        // Use word boundaries to avoid false positives like "REST" in "restaurant"
        const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        
        if (regex.test(text)) {
          // Additional context check to avoid false positives
          if (this.isSkillMentionValid(text, skill)) {
            skills.push({
              name: skill,
              category: category as 'technical' | 'soft' | 'industry',
              level: 'intermediate'
            });
          }
        }
      }
    }

    // Remove duplicates and limit to reasonable number
    const uniqueSkills = skills.filter((skill, index, arr) => 
      arr.findIndex(s => s.name.toLowerCase() === skill.name.toLowerCase()) === index
    ).slice(0, 15);

    return uniqueSkills;
  }

  private isSkillMentionValid(text: string, skill: string): boolean {
    // Avoid false positives by checking context
    const falsePositives: Record<string, RegExp> = {
      'REST': /restaurant|restroom|restock|restore/i,
      'AI': /daily|detail|retail|email|against/i,
      'GO': /\bgo\b(?!\s+(?:programming|language|developer))/i
    };

    const upperSkill = skill.toUpperCase();
    if (falsePositives[upperSkill]) {
      return !falsePositives[upperSkill].test(text);
    }

    return true;
  }

  private capitalizeWords(str: string): string {
    return str.replace(/\b\w+/g, word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
  }

  private isAddressPart(text: string): boolean {
    const addressParts = ['avenue', 'street', 'road', 'drive', 'lane', 'boulevard', 'bergenfield', 'jersey', 'new york', 'new jersey', 'plan', 'inc'];
    const zipPattern = /^\d{5}(-\d{4})?$/;
    const numberPattern = /^\d+$/;
    return addressParts.some(part => text.toLowerCase().includes(part)) || zipPattern.test(text) || numberPattern.test(text.replace(/\D/g, ''));
  }

  private isContactInfo(text: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phonePattern = /^\d{10,}$/;
    const websitePattern = /website|\.com|\.org|\.net/i;
    const emailLikePattern = /[a-zA-Z0-9]+@?[a-zA-Z0-9]*\.?[a-zA-Z]{2,}/;
    const phoneNumberPattern = /^\d{10}$/;
    
    const cleanText = text.replace(/\D/g, '');
    return emailPattern.test(text) || 
           phonePattern.test(cleanText) || 
           phoneNumberPattern.test(cleanText) ||
           websitePattern.test(text) ||
           emailLikePattern.test(text);
  }

  private isValidSkill(text: string): boolean {
    // Must be a meaningful skill, not just random words
    const invalidSkills = ['your website', 'website', 'com', 'org', 'net'];
    const cleanText = text.toLowerCase().trim();
    
    // Too short or too long
    if (cleanText.length < 3 || cleanText.length > 30) return false;
    
    // Contains invalid skill patterns
    if (invalidSkills.includes(cleanText)) return false;
    
    // All numbers
    if (/^\d+$/.test(cleanText)) return false;
    
    return true;
  }

  private generateSuggestions(data: ResumeData, text: string): string[] {
    const suggestions: string[] = [];

    if (!data.personal.fullName) {
      suggestions.push('Add your full name to the top of the resume');
    }
    if (!data.personal.email) {
      suggestions.push('Include a professional email address');
    }
    if (!data.personal.phone) {
      suggestions.push('Add your phone number for contact');
    }
    if (!data.personal.location) {
      suggestions.push('Consider adding your location (city, state)');
    }
    if (data.experience.length === 0) {
      suggestions.push('Add your work experience with specific achievements');
    }
    if (data.education.length === 0) {
      suggestions.push('Include your educational background');
    }
    if (data.skills.length < 5) {
      suggestions.push('Add more relevant skills to showcase your abilities');
    }
    if (!data.summary.careerObjective) {
      suggestions.push('Consider adding a professional summary or objective');
    }

    return suggestions;
  }

  private calculateConfidence(data: ResumeData, text: string): number {
    let score = 0;
    let maxScore = 0;

    // Personal information (30 points max)
    maxScore += 30;
    if (data.personal.fullName) score += 10;
    if (data.personal.email) score += 10;
    if (data.personal.phone) score += 10;

    // Experience (40 points max)
    maxScore += 40;
    if (data.experience.length > 0) {
      score += 20;
      if (data.experience.every(exp => exp.achievements && exp.achievements.length > 0)) {
        score += 20;
      }
    }

    // Education (15 points max)
    maxScore += 15;
    if (data.education.length > 0) score += 15;

    // Skills (15 points max)
    maxScore += 15;
    if (data.skills.length >= 5) score += 15;
    else if (data.skills.length > 0) score += data.skills.length * 3;

    return maxScore > 0 ? Math.round((score / maxScore) * 100) / 100 : 0;
  }
}