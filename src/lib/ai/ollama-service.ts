// Ollama Local AI Service
// Run AI models locally on your computer - completely free!

interface OllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
  };
}

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export class OllamaService {
  private baseUrl: string;
  private defaultModel: string;

  constructor(baseUrl: string = 'http://localhost:11434', defaultModel: string = 'llama3.1:8b') {
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;
  }

  // Check if Ollama is running
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      console.log('Ollama not available:', error);
      return false;
    }
  }

  // Get available models
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.error('Failed to get Ollama models:', error);
      return [];
    }
  }

  // Generate text using Ollama
  async generateText(prompt: string, model?: string, options?: any): Promise<string> {
    const requestBody: OllamaRequest = {
      model: model || this.defaultModel,
      prompt: this.createResumeEnhancementPrompt(prompt),
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 300,
        ...options
      }
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data: OllamaResponse = await response.json();
      return data.response.trim();
    } catch (error) {
      console.error('Ollama generation failed:', error);
      throw error;
    }
  }

  // Create a specialized prompt for resume enhancement
  private createResumeEnhancementPrompt(originalText: string): string {
    return `You are an expert resume writer specializing in Harvard methodology. Transform this simple job description into a professional, quantified bullet point:

Original: "${originalText}"

Guidelines:
- Use strong action verbs (Led, Developed, Optimized, Spearheaded, etc.)
- Include specific numbers and percentages when possible
- Make it ATS-friendly and professional
- Focus on achievements and impact
- Keep it concise but impactful (1-2 lines maximum)
- Follow PAR structure: Problem-Action-Result

Transform the text above following these guidelines. If the original lacks specific numbers, create realistic professional metrics. Return only the enhanced text without explanations.`;
  }

  // Bulk enhancement
  async enhanceMultipleTexts(texts: string[], model?: string): Promise<string[]> {
    const enhancedTexts: string[] = [];
    
    for (const text of texts) {
      try {
        const enhanced = await this.generateText(text, model);
        enhancedTexts.push(enhanced);
      } catch (error) {
        console.error(`Failed to enhance text: ${text}`, error);
        enhancedTexts.push(text); // Keep original if enhancement fails
      }
    }
    
    return enhancedTexts;
  }

  // Generate skill suggestions
  async generateSkillSuggestions(jobTitle: string, industry: string): Promise<string[]> {
    const prompt = `Generate 8-10 relevant skills for a ${jobTitle} position in the ${industry} industry. 
    Include both technical and soft skills. Return as a comma-separated list without numbering.`;

    try {
      const response = await this.generateText(prompt);
      return response.split(',').map(skill => skill.trim()).filter(Boolean);
    } catch (error) {
      console.error('Failed to generate skill suggestions:', error);
      return ['Leadership', 'Communication', 'Problem Solving', 'Team Collaboration'];
    }
  }

  // Generate career summary
  async generateCareerSummary(
    jobTitle: string,
    yearsExperience: number,
    keySkills: string[],
    industry: string = ''
  ): Promise<string> {
    const prompt = `Write a professional career summary for a ${jobTitle} with ${yearsExperience} years of experience${industry ? ` in the ${industry} industry` : ''}. 
    Key skills: ${keySkills.join(', ')}. 
    Make it compelling and professional, 2-3 sentences maximum.`;

    try {
      return await this.generateText(prompt);
    } catch (error) {
      console.error('Failed to generate career summary:', error);
      return `Results-driven ${jobTitle} with ${yearsExperience} years of experience seeking opportunities to leverage expertise in ${industry || 'professional'} environments.`;
    }
  }
}

// Default Ollama instance
export const ollamaService = new OllamaService();

// Helper function to check if Ollama is available and use it
export async function useOllamaIfAvailable<T>(
  ollamaFunction: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    const isAvailable = await ollamaService.isAvailable();
    if (isAvailable) {
      return await ollamaFunction();
    }
  } catch (error) {
    console.log('Ollama not available, using fallback');
  }
  return fallback;
}
