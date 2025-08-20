import { AIServiceManager } from '@/lib/ai/ai-service-manager';

export interface EnhancementResult {
  enhancedText: string;
  alternatives: string[];
  improvements: {
    confidence: number;
    quantificationSuggestions: QuantificationSuggestion[];
    strengthenedWords: string[];
    addedMetrics: string[];
  };
  originalText: string;
}

export interface QuantificationSuggestion {
  question: string;
  template: string;
  options: string[];
  category: 'size' | 'volume' | 'percentage' | 'time' | 'money' | 'frequency';
}

export interface EnhancementContext {
  industry?: string;
  roleLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  section?: 'experience' | 'education' | 'skills' | 'summary';
  position?: string;
  company?: string;
}

export class EnhancementEngine {
  private aiManager: AIServiceManager;
  private industryTemplates: Map<string, any>;
  private quantificationTemplates: Map<string, QuantificationSuggestion[]>;

  constructor() {
    this.aiManager = new AIServiceManager();
    this.industryTemplates = this.initializeIndustryTemplates();
    this.quantificationTemplates = this.initializeQuantificationTemplates();
  }

  async enhance(input: {
    originalText: string;
    industry?: string;
    roleLevel?: string;
    context?: any;
  }): Promise<EnhancementResult> {
    const { originalText, industry = 'general', roleLevel = 'entry', context = {} } = input;

    // Step 1: Get basic AI enhancement
    const enhancedText = await this.getBasicEnhancement(originalText, { industry, roleLevel, ...context });

    // Step 2: Generate alternatives
    const alternatives = await this.generateAlternatives(originalText, enhancedText, { industry, roleLevel });

    // Step 3: Create quantification suggestions
    const quantificationSuggestions = this.createQuantificationSuggestions(originalText, industry, roleLevel);

    // Step 4: Analyze improvements
    const improvements = this.analyzeImprovements(originalText, enhancedText, quantificationSuggestions);

    return {
      enhancedText,
      alternatives,
      improvements,
      originalText
    };
  }

  private async getBasicEnhancement(text: string, context: any): Promise<string> {
    try {
      // Use existing AI service manager for the base enhancement
      return await this.aiManager.enhanceText(text, context);
    } catch (error) {
      console.error('Basic enhancement failed:', error);
      return this.getFallbackEnhancement(text, context);
    }
  }

  private async generateAlternatives(originalText: string, enhancedText: string, context: any): Promise<string[]> {
    const alternatives: string[] = [];

    try {
      // Generate industry-specific alternatives
      const industryAlts = this.getIndustrySpecificAlternatives(originalText, context.industry);
      alternatives.push(...industryAlts);

      // Generate role-level specific alternatives
      const roleLevelAlts = this.getRoleLevelAlternatives(originalText, context.roleLevel);
      alternatives.push(...roleLevelAlts);

      // Ensure we don't duplicate the main enhanced text
      return alternatives.filter(alt => alt !== enhancedText && alt !== originalText).slice(0, 3);
    } catch (error) {
      console.error('Alternative generation failed:', error);
      return [];
    }
  }

  private createQuantificationSuggestions(text: string, industry: string, roleLevel: string): QuantificationSuggestion[] {
    const suggestions: QuantificationSuggestion[] = [];
    const lowerText = text.toLowerCase();

    // Team size suggestions
    if (lowerText.includes('team') || lowerText.includes('group') || lowerText.includes('people')) {
      suggestions.push({
        question: "How many people did you work with?",
        template: text.replace(/team|group|people/gi, "team of {size} members"),
        options: this.getTeamSizeOptions(roleLevel),
        category: 'size'
      });
    }

    // Volume/quantity suggestions
    if (lowerText.includes('customer') || lowerText.includes('client') || lowerText.includes('user')) {
      suggestions.push({
        question: "How many customers/clients did you serve?",
        template: text.replace(/customer[s]?|client[s]?|user[s]?/gi, "{volume}+ customers"),
        options: this.getVolumeOptions(industry, roleLevel),
        category: 'volume'
      });
    }

    // Performance/improvement suggestions
    if (lowerText.includes('improve') || lowerText.includes('increase') || lowerText.includes('better')) {
      suggestions.push({
        question: "By what percentage did you improve things?",
        template: text.replace(/improve[d]?|increase[d]?|better/gi, "improved by {percentage}%"),
        options: this.getPercentageOptions(roleLevel),
        category: 'percentage'
      });
    }

    // Time-based suggestions
    if (lowerText.includes('daily') || lowerText.includes('weekly') || lowerText.includes('regular')) {
      suggestions.push({
        question: "How often did this happen?",
        template: text.replace(/daily|weekly|regular/gi, "{frequency}"),
        options: this.getFrequencyOptions(),
        category: 'frequency'
      });
    }

    return suggestions.slice(0, 2); // Limit to 2 most relevant suggestions
  }

  private analyzeImprovements(originalText: string, enhancedText: string, quantSuggestions: QuantificationSuggestion[]): any {
    const originalWords = originalText.split(/\s+/).length;
    const enhancedWords = enhancedText.split(/\s+/).length;
    
    // Calculate confidence based on various factors
    let confidence = 0.6; // Base confidence

    // Bonus for adding numbers/metrics
    if (/\d+[%$]?/.test(enhancedText) && !/\d+[%$]?/.test(originalText)) {
      confidence += 0.15;
    }

    // Bonus for stronger action verbs
    const strongVerbs = ['achieved', 'implemented', 'optimized', 'streamlined', 'accelerated', 'enhanced'];
    const hasStrongVerbs = strongVerbs.some(verb => enhancedText.toLowerCase().includes(verb));
    if (hasStrongVerbs) {
      confidence += 0.1;
    }

    // Bonus for quantification suggestions
    if (quantSuggestions.length > 0) {
      confidence += 0.1;
    }

    // Bonus for proper length (not too short, not too long)
    if (enhancedWords >= originalWords * 1.2 && enhancedWords <= originalWords * 2) {
      confidence += 0.05;
    }

    return {
      confidence: Math.min(confidence, 0.95), // Cap at 95%
      quantificationSuggestions: quantSuggestions,
      strengthenedWords: this.findStrengthenedWords(originalText, enhancedText),
      addedMetrics: this.findAddedMetrics(originalText, enhancedText)
    };
  }

  private getFallbackEnhancement(text: string, context: any): string {
    // Simple rule-based enhancement as fallback
    let enhanced = text;

    // Replace weak verbs with strong ones
    const verbReplacements = {
      'helped': 'assisted',
      'worked on': 'collaborated on',
      'did': 'executed',
      'made': 'created',
      'got': 'achieved'
    };

    Object.entries(verbReplacements).forEach(([weak, strong]) => {
      enhanced = enhanced.replace(new RegExp(weak, 'gi'), strong);
    });

    return enhanced;
  }

  private initializeIndustryTemplates(): Map<string, any> {
    return new Map([
      ['technology', {
        verbs: ['developed', 'implemented', 'optimized', 'automated', 'architected'],
        metrics: ['performance', 'efficiency', 'scalability', 'user engagement'],
        buzzwords: ['agile', 'cross-functional', 'data-driven', 'innovative']
      }],
      ['retail', {
        verbs: ['achieved', 'exceeded', 'maintained', 'assisted', 'processed'],
        metrics: ['sales targets', 'customer satisfaction', 'inventory turnover'],
        buzzwords: ['customer-focused', 'results-driven', 'detail-oriented']
      }],
      ['healthcare', {
        verbs: ['administered', 'coordinated', 'documented', 'monitored', 'treated'],
        metrics: ['patient satisfaction', 'compliance rates', 'efficiency'],
        buzzwords: ['patient-centered', 'evidence-based', 'collaborative']
      }]
    ]);
  }

  private initializeQuantificationTemplates(): Map<string, QuantificationSuggestion[]> {
    return new Map([
      ['general', [
        {
          question: "How many people were involved?",
          template: "collaborated with team of {size} members",
          options: ['3-5', '5-10', '10-15', '15+'],
          category: 'size'
        }
      ]]
    ]);
  }

  private getIndustrySpecificAlternatives(text: string, industry: string): string[] {
    const template = this.industryTemplates.get(industry) || this.industryTemplates.get('general');
    if (!template) return [];

    const alternatives: string[] = [];
    
    // Generate one alternative with industry-specific verbs
    let industryAlt = text;
    template.verbs.forEach((verb: string, index: number) => {
      if (index === 0) { // Use first verb for this alternative
        industryAlt = industryAlt.replace(/\b(helped|worked|did|made)\b/gi, verb);
      }
    });
    if (industryAlt !== text) alternatives.push(industryAlt);

    return alternatives;
  }

  private getRoleLevelAlternatives(text: string, roleLevel: string): string[] {
    const alternatives: string[] = [];

    switch (roleLevel) {
      case 'entry':
        alternatives.push(text.replace(/\b(managed|led|directed)\b/gi, 'supported'));
        break;
      case 'mid':
        alternatives.push(text.replace(/\b(helped|assisted)\b/gi, 'coordinated'));
        break;
      case 'senior':
        alternatives.push(text.replace(/\b(worked on|did)\b/gi, 'spearheaded'));
        break;
      case 'executive':
        alternatives.push(text.replace(/\b(worked on|managed)\b/gi, 'strategically directed'));
        break;
    }

    return alternatives.filter(alt => alt !== text);
  }

  private getTeamSizeOptions(roleLevel: string): string[] {
    switch (roleLevel) {
      case 'entry': return ['2-3', '3-5', '5-8'];
      case 'mid': return ['5-8', '8-12', '12-15'];
      case 'senior': return ['10-15', '15-25', '25+'];
      case 'executive': return ['20+', '50+', '100+'];
      default: return ['3-5', '5-10', '10+'];
    }
  }

  private getVolumeOptions(industry: string, roleLevel: string): string[] {
    const baseVolumes = {
      retail: ['50', '100', '200', '500'],
      technology: ['1,000', '5,000', '10,000', '50,000'],
      healthcare: ['20', '50', '100', '200']
    };

    return baseVolumes[industry as keyof typeof baseVolumes] || ['50', '100', '200', '500'];
  }

  private getPercentageOptions(roleLevel: string): string[] {
    switch (roleLevel) {
      case 'entry': return ['15', '25', '35'];
      case 'mid': return ['25', '35', '50'];
      case 'senior': return ['40', '60', '80'];
      case 'executive': return ['50', '100', '150'];
      default: return ['20', '30', '40'];
    }
  }

  private getFrequencyOptions(): string[] {
    return ['daily', 'weekly', 'bi-weekly', 'monthly'];
  }

  private findStrengthenedWords(original: string, enhanced: string): string[] {
    const originalWords = new Set(original.toLowerCase().split(/\s+/));
    const enhancedWords = enhanced.toLowerCase().split(/\s+/);
    
    return enhancedWords.filter(word => 
      !originalWords.has(word) && 
      word.length > 3 &&
      /^[a-z]+$/.test(word)
    ).slice(0, 3);
  }

  private findAddedMetrics(original: string, enhanced: string): string[] {
    const metrics: string[] = [];
    const enhancedMetrics = enhanced.match(/\d+[%$]?|\d+[\s-]?\w+/g) || [];
    const originalMetrics = original.match(/\d+[%$]?|\d+[\s-]?\w+/g) || [];
    
    enhancedMetrics.forEach(metric => {
      if (!originalMetrics.includes(metric)) {
        metrics.push(metric);
      }
    });

    return metrics.slice(0, 2);
  }
}

// Cover Letter Engine for generating cover letters from resume data
export class CoverLetterEngine {
  private aiManager: AIServiceManager;

  constructor() {
    this.aiManager = new AIServiceManager();
  }

  async generateCoverLetter(data: {
    resumeData: any;
    jobPosting?: string;
    companyName?: string;
    positionTitle?: string;
    personalizedMessage?: string;
  }): Promise<string> {
    const { resumeData, jobPosting, companyName, positionTitle, personalizedMessage } = data;

    // Extract key information from resume
    const keySkills = resumeData.skills?.slice(0, 5) || [];
    const recentExperience = resumeData.experience?.[0] || {};
    const personalInfo = resumeData.personal || {};

    // Create a context-aware prompt
    const prompt = this.createCoverLetterPrompt({
      personalInfo,
      keySkills,
      recentExperience,
      jobPosting,
      companyName,
      positionTitle,
      personalizedMessage
    });

    try {
      // Use AI to generate the cover letter
      const coverLetter = await this.aiManager.enhanceText(prompt, {
        type: 'cover_letter',
        company: companyName,
        position: positionTitle
      });

      return coverLetter;
    } catch (error) {
      console.error('Cover letter generation failed:', error);
      return this.generateFallbackCoverLetter(data);
    }
  }

  private createCoverLetterPrompt(data: any): string {
    return `Write a professional cover letter using the following information:

Personal Info: ${data.personalInfo.name || '[Name]'}
Target Position: ${data.positionTitle || '[Position]'}
Target Company: ${data.companyName || '[Company]'}

Key Skills: ${data.keySkills.join(', ')}
Recent Experience: ${data.recentExperience.title || ''} at ${data.recentExperience.company || ''}

${data.jobPosting ? `Job Requirements: ${data.jobPosting.substring(0, 500)}` : ''}
${data.personalizedMessage ? `Personal Message: ${data.personalizedMessage}` : ''}

Generate a compelling, professional cover letter that highlights relevant experience and skills.`;
  }

  private generateFallbackCoverLetter(data: any): string {
    return `Dear Hiring Manager,

I am writing to express my strong interest in the ${data.positionTitle || 'position'} at ${data.companyName || 'your company'}. With my background in ${data.resumeData.experience?.[0]?.title || 'relevant experience'}, I am confident I can contribute effectively to your team.

${data.personalizedMessage || 'I believe my skills and experience align well with your requirements.'}

Thank you for your consideration. I look forward to hearing from you.

Sincerely,
${data.resumeData.personal?.name || '[Your Name]'}`;
  }
}
