// Hugging Face Inference API Service
// Free tier with generous limits - no API key required for many models!

interface HuggingFaceRequest {
  inputs: string;
  parameters?: {
    max_new_tokens?: number;
    temperature?: number;
    top_p?: number;
    do_sample?: boolean;
    return_full_text?: boolean;
  };
}

interface HuggingFaceResponse {
  generated_text: string;
}

export class HuggingFaceService {
  private baseUrl: string = 'https://api-inference.huggingface.co/models';
  private apiKey: string | null = null;
  private defaultModel: string = 'microsoft/DialoGPT-medium'; // Free model

  constructor(apiKey?: string) {
    this.apiKey = apiKey || null;
  }

  // Check if we have API access
  async isAvailable(): Promise<boolean> {
    try {
      const response = await this.makeRequest('test', 'Hello');
      return response !== null;
    } catch (error) {
      console.log('Hugging Face not available:', error);
      return false;
    }
  }

  // Make a request to Hugging Face API
  private async makeRequest(model: string, prompt: string, options?: any): Promise<string | null> {
    const url = `${this.baseUrl}/${model}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const requestBody: HuggingFaceRequest = {
      inputs: prompt,
      parameters: {
        max_new_tokens: 150,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true,
        return_full_text: false,
        ...options
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 503) {
          console.log('Model is loading, please wait...');
          return null;
        }
        throw new Error(`Hugging Face API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      if (Array.isArray(data) && data.length > 0) {
        return data[0].generated_text || data[0].text || '';
      }
      
      if (typeof data === 'string') {
        return data;
      }
      
      return data.generated_text || data.text || '';
    } catch (error) {
      console.error('Hugging Face request failed:', error);
      return null;
    }
  }

  // Enhance text using Hugging Face
  async enhanceText(text: string, context: any = {}): Promise<string | null> {
    const prompt = this.createResumeEnhancementPrompt(text, context);
    
    // Try different free models
    const models = [
      'microsoft/DialoGPT-medium',
      'gpt2',
      'distilgpt2'
    ];

    for (const model of models) {
      try {
        const result = await this.makeRequest(model, prompt);
        if (result && result.trim()) {
          return this.cleanResponse(result, text);
        }
      } catch (error) {
        console.log(`Model ${model} failed, trying next...`);
        continue;
      }
    }

    return null;
  }

  // Create enhancement prompt
  private createResumeEnhancementPrompt(originalText: string, context: any): string {
    const { jobTitle = '', industry = '' } = context;
    
    return `Transform this job description into professional resume language:

Original: "${originalText}"
${jobTitle ? `Job: ${jobTitle}` : ''}
${industry ? `Industry: ${industry}` : ''}

Make it professional with strong action verbs and quantified results. Keep it concise.`;
  }

  // Clean the response
  private cleanResponse(response: string, originalText: string): string {
    // Remove the original prompt from the response
    let cleaned = response.replace(originalText, '').trim();
    
    // Remove common prefixes
    cleaned = cleaned.replace(/^(Enhanced|Professional|Improved):\s*/i, '');
    
    // Ensure it starts with a capital letter
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    
    // Remove extra quotes
    cleaned = cleaned.replace(/^["']|["']$/g, '');
    
    return cleaned;
  }

  // Bulk enhancement
  async enhanceMultipleTexts(texts: string[], context: any = {}): Promise<string[]> {
    const enhancedTexts: string[] = [];
    
    for (const text of texts) {
      try {
        const enhanced = await this.enhanceText(text, context);
        enhancedTexts.push(enhanced || text);
      } catch (error) {
        console.error(`Failed to enhance text: ${text}`, error);
        enhancedTexts.push(text);
      }
    }
    
    return enhancedTexts;
  }

  // Generate skill suggestions
  async generateSkillSuggestions(jobTitle: string, industry: string): Promise<string[]> {
    const prompt = `Skills for ${jobTitle} in ${industry}:`;
    
    try {
      const response = await this.makeRequest('microsoft/DialoGPT-medium', prompt);
      if (response) {
        const skills = response.split(',').map(skill => skill.trim()).filter(Boolean);
        return skills.slice(0, 8); // Limit to 8 skills
      }
    } catch (error) {
      console.error('Failed to generate skill suggestions:', error);
    }
    
    return ['Leadership', 'Communication', 'Problem Solving', 'Team Collaboration'];
  }
}

// Default Hugging Face instance
export const huggingfaceService = new HuggingFaceService();

// Helper function to use Hugging Face if available
export async function useHuggingFaceIfAvailable<T>(
  hfFunction: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    const isAvailable = await huggingfaceService.isAvailable();
    if (isAvailable) {
      return await hfFunction();
    }
  } catch (error) {
    console.log('Hugging Face not available, using fallback');
  }
  return fallback;
}
