import { enhanceText } from './rule-based-enhancer';
import { enhanceTextWithTemplates } from './enhanced-templates';
import { ResumeData, JobDetails, CoverLetterData, CoverLetterGenerationRequest } from '../../types/resume';

export class CoverLetterService {
  // Generate a complete cover letter
  async generateCoverLetter(request: CoverLetterGenerationRequest): Promise<CoverLetterData> {
    const { resumeData, jobDetails, tone = 'professional', focus = 'balanced', length = 'standard' } = request;

    try {
      console.log('Generating cover letter with data:', {
        resumeDataKeys: Object.keys(resumeData),
        summaryKeys: resumeData.summary ? Object.keys(resumeData.summary) : 'undefined',
        keySkills: resumeData.summary?.keySkills,
        jobDetails: Object.keys(jobDetails)
      });
      
      // Generate opening paragraph
      console.log('About to generate opening...');
      const opening = await this.generateOpening(resumeData, jobDetails, tone);
      console.log('Opening generated successfully');
      
      // Generate body paragraphs based on focus
      const body = await this.generateBody(resumeData, jobDetails, tone, focus, length);
      
      // Generate closing paragraph
      const closing = await this.generateClosing(resumeData, jobDetails, tone);
      
      // Generate signature
      const signature = this.generateSignature(resumeData.personal);

      return {
        jobDetails,
        personalInfo: resumeData.personal,
        opening,
        body,
        closing,
        signature
      };
    } catch (error) {
      console.error('Error generating cover letter:', error);
      console.error('Error in cover letter service:', error instanceof Error ? error.stack : 'N/A');
      console.error('Resume data:', JSON.stringify(resumeData, null, 2));
      console.error('Job details:', JSON.stringify(jobDetails, null, 2));
      throw new Error(`Failed to generate cover letter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate opening paragraph
  private async generateOpening(resumeData: ResumeData, jobDetails: JobDetails, tone: string): Promise<string> {
    const context = {
      jobTitle: jobDetails.jobTitle,
      companyName: jobDetails.companyName,
      currentTitle: resumeData.summary.currentTitle,
      yearsExperience: resumeData.summary.yearsExperience,
      keySkills: (resumeData.summary.keySkills && resumeData.summary.keySkills.length > 0) 
        ? resumeData.summary.keySkills.slice(0, 3).join(', ')
        : 'technology and development',
      tone
    };

    const prompt = `Generate a professional opening paragraph for a cover letter with the following context:
    - Job Title: ${jobDetails.jobTitle}
    - Company: ${jobDetails.companyName}
    - Current Title: ${resumeData.summary.currentTitle}
    - Years of Experience: ${resumeData.summary.yearsExperience}
    - Key Skills: ${resumeData.summary.keySkills.slice(0, 3).join(', ')}
    - Tone: ${tone}
    
    The opening should be engaging, professional, and clearly state the candidate's interest in the position.`;

    // Use rule-based enhancement with fallback
    const keySkillsText = (resumeData.summary.keySkills && resumeData.summary.keySkills.length > 0) 
      ? resumeData.summary.keySkills.slice(0, 3).join(', ')
      : 'technology and development';
    const baseText = `I am writing to express my strong interest in the ${jobDetails.jobTitle} position at ${jobDetails.companyName}. With ${resumeData.summary.yearsExperience} years of experience as a ${resumeData.summary.currentTitle}, I am excited about the opportunity to contribute my expertise in ${keySkillsText} to your team.`;
    
    try {
      return enhanceText(baseText, {
        jobTitle: jobDetails.jobTitle,
        experienceLevel: resumeData.summary.yearsExperience >= 7 ? 'senior' : resumeData.summary.yearsExperience >= 3 ? 'mid' : 'entry'
      });
    } catch (error) {
      return baseText;
    }
  }

  // Generate body paragraphs
  private async generateBody(
    resumeData: ResumeData, 
    jobDetails: JobDetails, 
    tone: string, 
    focus: string, 
    length: string
  ): Promise<any[]> {
    const body: any[] = [];
    const paragraphCount = length === 'brief' ? 1 : length === 'standard' ? 2 : 3;

    // Determine what to focus on based on the focus parameter
    const focusAreas = this.getFocusAreas(focus, resumeData, jobDetails);

    for (let i = 0; i < Math.min(paragraphCount, focusAreas.length); i++) {
      const focusArea = focusAreas[i];
      const content = await this.generateBodyParagraph(resumeData, jobDetails, tone, focusArea);
      
      body.push({
        id: `body-${i + 1}`,
        type: focusArea.type,
        content,
        order: i + 1
      });
    }

    return body;
  }

  // Get focus areas based on user preference and available data
  private getFocusAreas(focus: string, resumeData: ResumeData, jobDetails: JobDetails): Array<{type: string, data: any}> {
    const areas: Array<{type: string, data: any}> = [];

    switch (focus) {
      case 'experience':
        if (resumeData.experience && resumeData.experience.length > 0) {
          areas.push({ type: 'experience', data: resumeData.experience[0] });
        }
        break;
      
      case 'skills':
        if (resumeData.skills && resumeData.skills.length > 0) {
          areas.push({ type: 'skills', data: resumeData.skills });
        }
        break;
      
      case 'achievements':
        if (resumeData.experience && resumeData.experience.length > 0 && 
            resumeData.experience[0].achievements && resumeData.experience[0].achievements.length > 0) {
          areas.push({ type: 'achievement', data: resumeData.experience[0].achievements });
        }
        break;
      
      case 'motivation':
        areas.push({ type: 'motivation', data: { companyName: jobDetails.companyName, jobTitle: jobDetails.jobTitle } });
        break;
      
      case 'balanced':
      default:
        // Balanced approach - include multiple areas
        if (resumeData.experience && resumeData.experience.length > 0) {
          areas.push({ type: 'experience', data: resumeData.experience[0] });
        }
        if (resumeData.skills && resumeData.skills.length > 0) {
          areas.push({ type: 'skills', data: resumeData.skills });
        }
        if (resumeData.experience && resumeData.experience.length > 0 && 
            resumeData.experience[0].achievements && resumeData.experience[0].achievements.length > 0) {
          areas.push({ type: 'achievement', data: resumeData.experience[0].achievements });
        }
        break;
    }

    return areas;
  }

  // Generate individual body paragraph
  private async generateBodyParagraph(
    resumeData: ResumeData, 
    jobDetails: JobDetails, 
    tone: string, 
    focusArea: {type: string, data: any}
  ): Promise<string> {
    const context = {
      jobTitle: jobDetails.jobTitle,
      companyName: jobDetails.companyName,
      tone,
      focusType: focusArea.type,
      focusData: focusArea.data
    };

    let prompt = '';

    switch (focusArea.type) {
      case 'experience':
        const exp = focusArea.data;
        prompt = `Write a professional paragraph about my work experience for a cover letter:
        - Company: ${exp.companyName}
        - Job Title: ${exp.jobTitle}
        - Duration: ${exp.startDate} to ${exp.endDate || 'Present'}
        - Job Description: ${exp.jobDescription}
        - Tone: ${tone}
        - Target Job: ${jobDetails.jobTitle} at ${jobDetails.companyName}
        
        Focus on relevant experience and achievements that align with the target position.`;
        break;
      
      case 'skills':
        const skills = focusArea.data;
        const technicalSkills = skills.filter((s: any) => s.category === 'technical').map((s: any) => s.name).join(', ');
        const softSkills = skills.filter((s: any) => s.category === 'soft').map((s: any) => s.name).join(', ');
        
        prompt = `Write a professional paragraph about my skills for a cover letter:
        - Technical Skills: ${technicalSkills}
        - Soft Skills: ${softSkills}
        - Target Job: ${jobDetails.jobTitle} at ${jobDetails.companyName}
        - Tone: ${tone}
        
        Highlight how my skills align with the position requirements.`;
        break;
      
      case 'achievement':
        const achievements = focusArea.data;
        prompt = `Write a professional paragraph about my key achievements for a cover letter:
        - Achievements: ${achievements.join('; ')}
        - Target Job: ${jobDetails.jobTitle} at ${jobDetails.companyName}
        - Tone: ${tone}
        
        Focus on quantifiable results and impact.`;
        break;
      
      case 'motivation':
        prompt = `Write a professional paragraph about my motivation for applying to this position:
        - Target Job: ${jobDetails.jobTitle}
        - Company: ${jobDetails.companyName}
        - My Current Role: ${resumeData.summary.currentTitle}
        - Years of Experience: ${resumeData.summary.yearsExperience}
        - Tone: ${tone}
        
        Express genuine interest in the company and position.`;
        break;
      
      default:
        prompt = `Write a professional paragraph for a cover letter:
        - Target Job: ${jobDetails.jobTitle} at ${jobDetails.companyName}
        - My Background: ${resumeData.summary.currentTitle} with ${resumeData.summary.yearsExperience} years of experience
        - Tone: ${tone}`;
    }

    // Use fallback content directly (rule-based approach)
    const fallbackContent = this.getFallbackContent(focusArea.type, resumeData, jobDetails);
    
    try {
      return enhanceText(fallbackContent, {
        jobTitle: jobDetails.jobTitle,
        experienceLevel: resumeData.summary.yearsExperience >= 7 ? 'senior' : resumeData.summary.yearsExperience >= 3 ? 'mid' : 'entry'
      });
    } catch (error) {
      return fallbackContent;
    }
  }

  // Generate closing paragraph
  private async generateClosing(resumeData: ResumeData, jobDetails: JobDetails, tone: string): Promise<string> {
    const context = {
      jobTitle: jobDetails.jobTitle,
      companyName: jobDetails.companyName,
      fullName: resumeData.personal.fullName,
      tone
    };

    const prompt = `Generate a professional closing paragraph for a cover letter:
    - Job Title: ${jobDetails.jobTitle}
    - Company: ${jobDetails.companyName}
    - Candidate Name: ${resumeData.personal.fullName}
    - Tone: ${tone}
    
    The closing should express enthusiasm for the opportunity, request an interview, and provide contact information.`;

    // Use rule-based enhancement with fallback
    const baseText = `I am excited about the opportunity to contribute to ${jobDetails.companyName} and would welcome the chance to discuss how my background, skills, and enthusiasm can benefit your team. I look forward to hearing from you and am available for an interview at your convenience. Thank you for considering my application.`;
    
    try {
      return enhanceText(baseText, {
        jobTitle: jobDetails.jobTitle,
        experienceLevel: resumeData.summary.yearsExperience >= 7 ? 'senior' : resumeData.summary.yearsExperience >= 3 ? 'mid' : 'entry'
      });
    } catch (error) {
      return baseText;
    }
  }

  // Generate signature
  private generateSignature(personalInfo: any): string {
    return `Sincerely,\n\n${personalInfo.fullName}\n${personalInfo.email}\n${personalInfo.phone}`;
  }

  // Get fallback content for different paragraph types
  private getFallbackContent(type: string, resumeData: ResumeData, jobDetails: JobDetails): string {
    switch (type) {
      case 'experience':
        const exp = resumeData.experience && resumeData.experience[0];
        const description = exp?.jobDescription || 'various technical projects';
        const expJobTitle = exp?.jobTitle || 'my previous role';
        const expCompany = exp?.companyName || 'my previous company';
        return `In my current role as ${expJobTitle} at ${expCompany}, I have developed strong expertise in ${description.toLowerCase().split(' ').slice(0, 10).join(' ')}. This experience has prepared me well for the ${jobDetails.jobTitle} position at ${jobDetails.companyName}, where I can apply my skills and knowledge to contribute to your team's success.`;
      
      case 'skills':
        const skills = (resumeData.skills && resumeData.skills.length > 0) 
          ? resumeData.skills.slice(0, 5).map(s => s.name || s).join(', ')
          : 'technology and development';
        return `My technical and professional skills, including ${skills}, align perfectly with the requirements for the ${jobDetails.jobTitle} position. I am confident that my combination of technical expertise and soft skills makes me an ideal candidate for this role at ${jobDetails.companyName}.`;
      
      case 'achievement':
        return `Throughout my career, I have consistently delivered results and exceeded expectations. My track record of achievement demonstrates my ability to drive success and make meaningful contributions to organizational goals, which I am eager to bring to the ${jobDetails.jobTitle} role at ${jobDetails.companyName}.`;
      
      case 'motivation':
        return `I am particularly drawn to ${jobDetails.companyName} because of its reputation for innovation and excellence. The opportunity to join your team as a ${jobDetails.jobTitle} represents an exciting next step in my career, and I am eager to contribute to your continued success.`;
      
      default:
        return `My background and experience make me well-suited for the ${jobDetails.jobTitle} position at ${jobDetails.companyName}. I am excited about the opportunity to contribute to your team and look forward to discussing how I can add value to your organization.`;
    }
  }

  // Enhance existing cover letter content
  async enhanceCoverLetterContent(content: string, context: any = {}): Promise<string> {
    try {
      return enhanceText(content, {
        jobTitle: context.jobTitle,
        experienceLevel: context.experienceLevel || 'mid'
      });
    } catch (error) {
      return content;
    }
  }

  // Generate cover letter from job posting
  async generateFromJobPosting(
    resumeData: ResumeData, 
    jobPosting: string, 
    companyName: string, 
    jobTitle: string,
    tone: string = 'professional'
  ): Promise<CoverLetterData> {
    // Extract job details from posting
    const jobDetails: JobDetails = {
      companyName,
      jobTitle,
      jobDescription: jobPosting,
      requirements: this.extractRequirements(jobPosting)
    };

    return this.generateCoverLetter({
      resumeData,
      jobDetails,
      tone: tone as 'professional' | 'enthusiastic' | 'confident' | 'formal',
      focus: 'balanced',
      length: 'standard'
    });
  }

  // Extract requirements from job posting
  private extractRequirements(jobPosting: string): string[] {
    const requirements: string[] = [];
    const lines = jobPosting.split('\n');
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('requirement') || lowerLine.includes('qualification') || 
          lowerLine.includes('skill') || lowerLine.includes('experience')) {
        requirements.push(line.trim());
      }
    }
    
    return requirements.slice(0, 5); // Limit to 5 requirements
  }
}

export const coverLetterService = new CoverLetterService();
