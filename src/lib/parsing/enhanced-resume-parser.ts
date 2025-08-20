// Enhanced Resume Parser - Actually recognizes and extracts content properly
import { KeywordBank } from '@/lib/content/keyword-bank';

export interface ParsedResumeData {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
  };
  summary: string;
  experience: {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    location: string;
    descriptions: string[];
    industry?: string;
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
    gpa?: string;
    honors?: string[];
  }[];
  skills: {
    technical: string[];
    soft: string[];
    certifications: string[];
    languages: string[];
  };
  projects?: {
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }[];
  confidence: number;
  detectedIndustry: string;
}

export class EnhancedResumeParser {
  private keywordBank: KeywordBank;

  constructor() {
    this.keywordBank = new KeywordBank();
  }

  parseResumeText(text: string): ParsedResumeData {
    console.log('🔍 Starting enhanced resume parsing...');
    
    // Clean and normalize text
    const cleanText = this.cleanText(text);
    const sections = this.identifySections(cleanText);
    
    console.log('📋 Identified sections:', Object.keys(sections));

    // Extract personal information
    const personal = this.extractPersonalInfo(sections.header || sections.contact || '');
    
    // Extract experience with better recognition
    const experience = this.extractExperience(sections.experience || sections.work || '');
    
    // Extract education
    const education = this.extractEducation(sections.education || '');
    
    // Extract skills with categorization
    const skills = this.extractSkills(sections.skills || '', experience);
    
    // Extract projects if present
    const projects = this.extractProjects(sections.projects || '');
    
    // Extract summary/objective
    const summary = this.extractSummary(sections.summary || sections.objective || '');
    
    // Detect industry based on content
    const detectedIndustry = this.detectIndustry(experience, skills);
    
    // Calculate confidence score
    const confidence = this.calculateConfidence(personal, experience, education, skills);

    console.log(`✅ Parsing complete. Industry: ${detectedIndustry}, Confidence: ${confidence}`);

    return {
      personal,
      summary,
      experience,
      education,
      skills,
      projects,
      confidence,
      detectedIndustry
    };
  }

  private cleanText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n\s*\n/g, '\n\n')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private identifySections(text: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const lines = text.split('\n');
    
    // Common section headers with variations
    const sectionPatterns = {
      header: /^(contact|personal|info)/i,
      summary: /^(summary|objective|profile|about)/i,
      experience: /^(experience|employment|work|professional|career)/i,
      education: /^(education|academic|learning|degrees?)/i,
      skills: /^(skills|competencies|technical|abilities|expertise)/i,
      projects: /^(projects|portfolio|work samples)/i,
      certifications: /^(certifications?|licenses?|credentials)/i,
      awards: /^(awards|honors|achievements|recognition)/i
    };

    let currentSection = 'header';
    let currentContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Check if this line is a section header
      let foundSection = false;
      for (const [sectionName, pattern] of Object.entries(sectionPatterns)) {
        if (pattern.test(line) && line.length < 50) { // Section headers are usually short
          // Save previous section
          if (currentContent.length > 0) {
            sections[currentSection] = currentContent.join('\n').trim();
          }
          
          currentSection = sectionName;
          currentContent = [];
          foundSection = true;
          break;
        }
      }

      if (!foundSection) {
        currentContent.push(line);
      }
    }

    // Save the last section
    if (currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n').trim();
    }

    return sections;
  }

  private extractPersonalInfo(headerText: string): any {
    const personal = {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: ''
    };

    const lines = headerText.split('\n').filter(line => line.trim());

    // Extract email (most reliable)
    const emailMatch = headerText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) personal.email = emailMatch[1];

    // Extract phone (various formats)
    const phoneMatch = headerText.match(/(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/);
    if (phoneMatch) personal.phone = phoneMatch[1];

    // Extract LinkedIn
    const linkedinMatch = headerText.match(/(linkedin\.com\/in\/[a-zA-Z0-9\-]+|in\/[a-zA-Z0-9\-]+)/);
    if (linkedinMatch) personal.linkedin = linkedinMatch[1];

    // Extract website
    const websiteMatch = headerText.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/);
    if (websiteMatch && !websiteMatch[1].includes('linkedin')) {
      personal.website = websiteMatch[1];
    }

    // Extract location (city, state pattern)
    const locationMatch = headerText.match(/([A-Za-z\s]+,\s*[A-Z]{2}(?:\s+[0-9]{5})?)/);
    if (locationMatch) personal.location = locationMatch[1];

    // Extract name (usually the first substantial line without contact info)
    for (const line of lines) {
      if (line.length > 5 && line.length < 50 && 
          !line.includes('@') && 
          !line.match(/\d{3}/) && 
          !line.includes('linkedin') &&
          !line.includes('http')) {
        personal.name = line.trim();
        break;
      }
    }

    return personal;
  }

  private extractExperience(experienceText: string): any[] {
    const experiences: any[] = [];
    const blocks = this.splitIntoBlocks(experienceText);

    for (const block of blocks) {
      const lines = block.split('\n').filter(line => line.trim());
      if (lines.length < 2) continue;

      let experience = {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        location: '',
        descriptions: [],
        industry: ''
      };

      // Look for company and position patterns
      for (let i = 0; i < Math.min(3, lines.length); i++) {
        const line = lines[i];
        
        // Company name patterns (often have Inc, LLC, Corp, etc.)
        if (this.looksLikeCompany(line) && !experience.company) {
          experience.company = line.trim();
          continue;
        }
        
        // Job title patterns
        if (this.looksLikeJobTitle(line) && !experience.position) {
          experience.position = line.trim();
          continue;
        }
        
        // Date patterns
        const dateMatch = line.match(/(\w+\s+\d{4})\s*[-–—]\s*(\w+\s+\d{4}|present|current)/i);
        if (dateMatch) {
          experience.startDate = dateMatch[1];
          experience.endDate = dateMatch[2];
          continue;
        }
      }

      // Extract job descriptions (bullet points)
      const descriptions: string[] = [];
      for (const line of lines) {
        if (line.match(/^[•\-\*\+→]\s/) || 
            (line.length > 20 && !this.looksLikeCompany(line) && !this.looksLikeJobTitle(line))) {
          descriptions.push(line.replace(/^[•\-\*\+→]\s*/, '').trim());
        }
      }
      
      experience.descriptions = descriptions;
      experience.industry = this.guessIndustryFromCompany(experience.company, experience.position);

      if (experience.company || experience.position) {
        experiences.push(experience);
      }
    }

    return experiences;
  }

  private extractEducation(educationText: string): any[] {
    const education: any[] = [];
    const blocks = this.splitIntoBlocks(educationText);

    for (const block of blocks) {
      const lines = block.split('\n').filter(line => line.trim());
      
      let edu = {
        institution: '',
        degree: '',
        field: '',
        graduationDate: '',
        gpa: '',
        honors: []
      };

      for (const line of lines) {
        // University/College names
        if (line.match(/(university|college|institute|school)/i) && !edu.institution) {
          edu.institution = line.trim();
          continue;
        }
        
        // Degree patterns
        if (line.match(/(bachelor|master|phd|associate|certificate|diploma)/i) && !edu.degree) {
          const degreeMatch = line.match(/(bachelor|master|phd|associate|certificate|diploma).*?(in|of)\s+(.+)/i);
          if (degreeMatch) {
            edu.degree = degreeMatch[1];
            edu.field = degreeMatch[3];
          } else {
            edu.degree = line.trim();
          }
          continue;
        }
        
        // GPA
        const gpaMatch = line.match(/gpa:?\s*([0-9.]+)/i);
        if (gpaMatch) {
          edu.gpa = gpaMatch[1];
          continue;
        }
        
        // Graduation date
        const gradMatch = line.match(/(\d{4}|\w+\s+\d{4})/);
        if (gradMatch) {
          edu.graduationDate = gradMatch[1];
          continue;
        }
      }

      if (edu.institution || edu.degree) {
        education.push(edu);
      }
    }

    return education;
  }

  private extractSkills(skillsText: string, experience: any[]): any {
    const skills = {
      technical: [],
      soft: [],
      certifications: [],
      languages: []
    };

    // Extract from skills section
    const skillLines = skillsText.split(/[,\n•\-\*]/).map(s => s.trim()).filter(s => s.length > 1);
    
    // Also extract from job descriptions
    const allDescriptions = experience.flatMap(exp => exp.descriptions).join(' ');
    
    // Use keyword bank to categorize skills
    const allIndustries = this.keywordBank.getAllIndustries();
    
    for (const industry of allIndustries) {
      const keywords = this.keywordBank.getIndustryKeywords(industry);
      if (!keywords) continue;
      
      // Check technical skills
      for (const skill of keywords.skills) {
        if (this.textContainsSkill(skillsText + ' ' + allDescriptions, skill)) {
          if (!skills.technical.includes(skill)) {
            skills.technical.push(skill);
          }
        }
      }
      
      // Check tools
      for (const tool of keywords.tools) {
        if (this.textContainsSkill(skillsText + ' ' + allDescriptions, tool)) {
          if (!skills.technical.includes(tool)) {
            skills.technical.push(tool);
          }
        }
      }
      
      // Check certifications
      for (const cert of keywords.certifications) {
        if (this.textContainsSkill(skillsText + ' ' + allDescriptions, cert)) {
          if (!skills.certifications.includes(cert)) {
            skills.certifications.push(cert);
          }
        }
      }
    }

    // Extract soft skills
    const softSkillPatterns = [
      'leadership', 'communication', 'teamwork', 'problem solving', 'analytical',
      'project management', 'time management', 'customer service', 'adaptability',
      'critical thinking', 'attention to detail', 'multitasking'
    ];
    
    for (const softSkill of softSkillPatterns) {
      if (this.textContainsSkill(skillsText + ' ' + allDescriptions, softSkill)) {
        skills.soft.push(softSkill);
      }
    }

    // Extract languages
    const languagePatterns = [
      'spanish', 'french', 'german', 'chinese', 'japanese', 'portuguese', 'italian', 'russian'
    ];
    
    for (const lang of languagePatterns) {
      if (this.textContainsSkill(skillsText, lang)) {
        skills.languages.push(lang);
      }
    }

    return skills;
  }

  private extractProjects(projectsText: string): any[] {
    const projects: any[] = [];
    const blocks = this.splitIntoBlocks(projectsText);

    for (const block of blocks) {
      const lines = block.split('\n').filter(line => line.trim());
      if (lines.length < 2) continue;

      const project = {
        name: lines[0].trim(),
        description: '',
        technologies: [],
        url: ''
      };

      // Extract description and technologies
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.includes('http')) {
          project.url = line.trim();
        } else if (line.includes('Technologies:') || line.includes('Tech:')) {
          const techMatch = line.match(/technologies?:?\s*(.+)/i);
          if (techMatch) {
            project.technologies = techMatch[1].split(/[,\s]+/).filter(t => t.length > 1);
          }
        } else {
          project.description += ' ' + line;
        }
      }

      project.description = project.description.trim();
      projects.push(project);
    }

    return projects;
  }

  private extractSummary(summaryText: string): string {
    return summaryText.split('\n').join(' ').trim();
  }

  private detectIndustry(experience: any[], skills: any): string {
    const industries = this.keywordBank.getAllIndustries();
    const scores: Record<string, number> = {};

    // Initialize scores
    industries.forEach(industry => scores[industry] = 0);

    // Score based on experience
    for (const exp of experience) {
      if (exp.industry && scores[exp.industry] !== undefined) {
        scores[exp.industry] += 3;
      }
      
      // Score based on job descriptions
      const allText = exp.descriptions.join(' ').toLowerCase();
      for (const industry of industries) {
        const keywords = this.keywordBank.getIndustryKeywords(industry);
        if (!keywords) continue;
        
        for (const skill of keywords.skills) {
          if (allText.includes(skill.toLowerCase())) {
            scores[industry] += 1;
          }
        }
      }
    }

    // Score based on skills
    for (const industry of industries) {
      const keywords = this.keywordBank.getIndustryKeywords(industry);
      if (!keywords) continue;
      
      for (const skill of [...skills.technical, ...skills.certifications]) {
        if (keywords.skills.some(kw => kw.toLowerCase().includes(skill.toLowerCase())) ||
            keywords.certifications.some(cert => cert.toLowerCase().includes(skill.toLowerCase()))) {
          scores[industry] += 2;
        }
      }
    }

    // Return industry with highest score
    const topIndustry = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b);
    return topIndustry[1] > 0 ? topIndustry[0] : 'general';
  }

  private calculateConfidence(personal: any, experience: any[], education: any[], skills: any): number {
    let score = 0;
    let maxScore = 0;

    // Personal info scoring
    maxScore += 5;
    if (personal.name) score += 1;
    if (personal.email) score += 1;
    if (personal.phone) score += 1;
    if (personal.location) score += 1;
    if (personal.linkedin) score += 1;

    // Experience scoring
    maxScore += 10;
    if (experience.length > 0) score += 2;
    if (experience.some(exp => exp.company && exp.position)) score += 3;
    if (experience.some(exp => exp.descriptions.length > 0)) score += 3;
    if (experience.some(exp => exp.startDate && exp.endDate)) score += 2;

    // Education scoring
    maxScore += 3;
    if (education.length > 0) score += 1;
    if (education.some(edu => edu.institution && edu.degree)) score += 2;

    // Skills scoring
    maxScore += 2;
    if (skills.technical.length > 0) score += 1;
    if (skills.technical.length > 3) score += 1;

    return Math.round((score / maxScore) * 100) / 100;
  }

  // Helper methods
  private splitIntoBlocks(text: string): string[] {
    return text.split(/\n\s*\n/).filter(block => block.trim().length > 0);
  }

  private looksLikeCompany(line: string): boolean {
    return /\b(inc|llc|corp|company|ltd|limited|group|systems|solutions|services|technologies)\b/i.test(line) ||
           line.length < 60; // Company names are usually not too long
  }

  private looksLikeJobTitle(line: string): boolean {
    const titleKeywords = [
      'manager', 'director', 'engineer', 'developer', 'analyst', 'specialist', 
      'coordinator', 'assistant', 'associate', 'representative', 'technician',
      'consultant', 'administrator', 'supervisor', 'lead', 'senior', 'junior'
    ];
    return titleKeywords.some(keyword => line.toLowerCase().includes(keyword));
  }

  private guessIndustryFromCompany(company: string, position: string): string {
    const text = (company + ' ' + position).toLowerCase();
    
    if (text.match(/tech|software|web|app|digital|computer|it\b/)) return 'technology';
    if (text.match(/health|medical|hospital|clinic|care|nurse|doctor/)) return 'healthcare';
    if (text.match(/bank|finance|accounting|investment|insurance/)) return 'finance';
    if (text.match(/sales|retail|marketing|customer/)) return 'sales';
    if (text.match(/plumb|pipe|water|drain/)) return 'plumbing';
    if (text.match(/hvac|heating|cooling|air|ventilation/)) return 'hvac';
    if (text.match(/electric|electrical|wire|power/)) return 'electrical';
    
    return 'general';
  }

  private textContainsSkill(text: string, skill: string): boolean {
    const textLower = text.toLowerCase();
    const skillLower = skill.toLowerCase();
    
    // Check for exact match or close variations
    return textLower.includes(skillLower) ||
           textLower.includes(skillLower.replace(/\s+/g, '')) ||
           textLower.includes(skillLower.replace(/\s+/g, '-'));
  }
}
