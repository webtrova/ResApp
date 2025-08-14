// Unified AI Service Manager
// Intelligently chooses between different free AI options

import { ollamaService, useOllamaIfAvailable } from './ollama-service';
import { huggingfaceService, useHuggingFaceIfAvailable } from './huggingface-service';
import { enhanceTextWithTemplates, generateIndustrySkills } from './enhanced-templates';
import { enhanceText } from './rule-based-enhancer';

interface AIServiceConfig {
  priority: 'ollama' | 'huggingface' | 'templates' | 'rule-based';
  enableOllama: boolean;
  enableHuggingFace: boolean;
  enableTemplates: boolean;
  enableRuleBased: boolean;
}

class AIServiceManager {
  private config: AIServiceConfig;
  private serviceStatus: {
    ollama: boolean;
    huggingface: boolean;
    templates: boolean;
    ruleBased: boolean;
  } = {
    ollama: false,
    huggingface: false,
    templates: true,
    ruleBased: true
  };

  constructor(config: Partial<AIServiceConfig> = {}) {
    this.config = {
      priority: 'templates',
      enableOllama: true,
      enableHuggingFace: true,
      enableTemplates: true,
      enableRuleBased: true,
      ...config
    };
  }

  // Initialize and check service availability
  async initialize(): Promise<void> {
    console.log('🔍 Initializing AI services...');

    // Check Ollama availability
    if (this.config.enableOllama) {
      try {
        this.serviceStatus.ollama = await ollamaService.isAvailable();
        console.log(`Ollama: ${this.serviceStatus.ollama ? '✅ Available' : '❌ Not available'}`);
      } catch (error) {
        console.log('Ollama: ❌ Error checking availability');
        this.serviceStatus.ollama = false;
      }
    }

    // Check Hugging Face availability
    if (this.config.enableHuggingFace) {
      try {
        this.serviceStatus.huggingface = await huggingfaceService.isAvailable();
        console.log(`Hugging Face: ${this.serviceStatus.huggingface ? '✅ Available' : '❌ Not available'}`);
      } catch (error) {
        console.log('Hugging Face: ❌ Error checking availability');
        this.serviceStatus.huggingface = false;
      }
    }

    // Templates and rule-based are always available
    this.serviceStatus.templates = this.config.enableTemplates;
    this.serviceStatus.ruleBased = this.config.enableRuleBased;

    console.log('🎯 AI Services initialized:', this.serviceStatus);
  }

  // Get the best available service based on priority
  private getBestService(): string {
    const priority = this.config.priority;
    
    switch (priority) {
      case 'ollama':
        if (this.serviceStatus.ollama) return 'ollama';
        if (this.serviceStatus.huggingface) return 'huggingface';
        if (this.serviceStatus.templates) return 'templates';
        return 'rule-based';
      
      case 'huggingface':
        if (this.serviceStatus.huggingface) return 'huggingface';
        if (this.serviceStatus.ollama) return 'ollama';
        if (this.serviceStatus.templates) return 'templates';
        return 'rule-based';
      
      case 'templates':
        if (this.serviceStatus.templates) return 'templates';
        if (this.serviceStatus.ollama) return 'ollama';
        if (this.serviceStatus.huggingface) return 'huggingface';
        return 'rule-based';
      
      default:
        if (this.serviceStatus.templates) return 'templates';
        if (this.serviceStatus.ollama) return 'ollama';
        if (this.serviceStatus.huggingface) return 'huggingface';
        return 'rule-based';
    }
  }

  // Enhance text using the best available service
  async enhanceText(text: string, context: any = {}): Promise<string> {
    const service = this.getBestService();
    console.log(`🤖 Using AI service: ${service}`);

    try {
      switch (service) {
        case 'ollama':
          return await ollamaService.generateText(text, undefined, context);
        
        case 'huggingface':
          const hfResult = await huggingfaceService.enhanceText(text, context);
          return hfResult || text;
        
        case 'templates':
          return enhanceTextWithTemplates(text, context);
        
        case 'rule-based':
        default:
          return enhanceText(text, context);
      }
    } catch (error) {
      console.error(`❌ ${service} failed, falling back to rule-based:`, error);
      return enhanceText(text, context);
    }
  }

  // Bulk enhancement with progress tracking
  async enhanceMultipleTexts(texts: string[], context: any = {}): Promise<string[]> {
    const service = this.getBestService();
    console.log(`🤖 Bulk enhancement using: ${service}`);

    const enhancedTexts: string[] = [];
    
    for (let i = 0; i < texts.length; i++) {
      try {
        const enhanced = await this.enhanceText(texts[i], context);
        enhancedTexts.push(enhanced);
        
        // Log progress
        if ((i + 1) % 5 === 0 || i === texts.length - 1) {
          console.log(`📊 Enhanced ${i + 1}/${texts.length} items`);
        }
      } catch (error) {
        console.error(`Failed to enhance text ${i + 1}:`, error);
        enhancedTexts.push(texts[i]); // Keep original if enhancement fails
      }
    }
    
    return enhancedTexts;
  }

  // Generate skill suggestions
  async generateSkillSuggestions(jobTitle: string, industry: string): Promise<string[]> {
    const service = this.getBestService();
    
    try {
      switch (service) {
        case 'ollama':
          return await ollamaService.generateSkillSuggestions(jobTitle, industry);
        
        case 'huggingface':
          return await huggingfaceService.generateSkillSuggestions(jobTitle, industry);
        
        case 'templates':
        case 'rule-based':
        default:
          return generateIndustrySkills(industry);
      }
    } catch (error) {
      console.error('Skill suggestions failed, using fallback:', error);
      return generateIndustrySkills(industry);
    }
  }

  // Generate career summary
  async generateCareerSummary(
    jobTitle: string,
    yearsExperience: number,
    keySkills: string[],
    industry: string = ''
  ): Promise<string> {
    const service = this.getBestService();
    
    try {
      switch (service) {
        case 'ollama':
          return await ollamaService.generateCareerSummary(jobTitle, yearsExperience, keySkills, industry);
        
        case 'huggingface':
          // Hugging Face doesn't have a specific summary method, use templates
          return this.generateSummaryWithTemplates(jobTitle, yearsExperience, keySkills, industry);
        
        case 'templates':
        case 'rule-based':
        default:
          return this.generateSummaryWithTemplates(jobTitle, yearsExperience, keySkills, industry);
      }
    } catch (error) {
      console.error('Career summary failed, using fallback:', error);
      return this.generateSummaryWithTemplates(jobTitle, yearsExperience, keySkills, industry);
    }
  }

  // Generate summary using templates
  private generateSummaryWithTemplates(
    jobTitle: string,
    yearsExperience: number,
    keySkills: string[],
    industry: string = ''
  ): string {
    const level = yearsExperience < 2 ? 'entry-level' : yearsExperience < 5 ? 'mid-level' : 'senior';
    const industryContext = industry ? ` in the ${industry} industry` : '';
    
    return `Results-driven ${jobTitle} with ${yearsExperience} years of experience${industryContext}. Proven track record of ${keySkills.slice(0, 3).join(', ')} and ${keySkills.slice(3, 5).join(', ')}. Seeking opportunities to leverage expertise in ${industry || 'professional'} environments to drive organizational success and achieve measurable results.`;
  }

  // Get service status
  getServiceStatus() {
    return { ...this.serviceStatus };
  }

  // Get available services
  getAvailableServices(): string[] {
    const services: string[] = [];
    if (this.serviceStatus.ollama) services.push('ollama');
    if (this.serviceStatus.huggingface) services.push('huggingface');
    if (this.serviceStatus.templates) services.push('templates');
    if (this.serviceStatus.ruleBased) services.push('rule-based');
    return services;
  }

  // Set service priority
  setPriority(priority: AIServiceConfig['priority']) {
    this.config.priority = priority;
    console.log(`🎯 AI service priority set to: ${priority}`);
  }

  // Test all services
  async testServices(): Promise<Record<string, { available: boolean; response?: string; error?: string }>> {
    const testText = "I helped customers with their problems";
    const results: Record<string, { available: boolean; response?: string; error?: string }> = {};

    // Test each service
    for (const service of ['ollama', 'huggingface', 'templates', 'rule-based']) {
      try {
        let response: string;
        
        switch (service) {
          case 'ollama':
            if (this.serviceStatus.ollama) {
              response = await ollamaService.generateText(testText);
            } else {
              throw new Error('Service not available');
            }
            break;
          
          case 'huggingface':
            if (this.serviceStatus.huggingface) {
              response = await huggingfaceService.enhanceText(testText) || testText;
            } else {
              throw new Error('Service not available');
            }
            break;
          
          case 'templates':
            response = enhanceTextWithTemplates(testText);
            break;
          
          case 'rule-based':
            response = enhanceText(testText);
            break;
          
          default:
            throw new Error('Unknown service');
        }
        
        results[service] = { available: true, response };
      } catch (error) {
        results[service] = { 
          available: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    }

    return results;
  }
}

// Default AI service manager instance
export const aiServiceManager = new AIServiceManager();

// Initialize the manager when the module is loaded
if (typeof window === 'undefined') {
  // Only initialize on server side
  aiServiceManager.initialize().catch(console.error);
}
