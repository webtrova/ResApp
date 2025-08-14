import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize DeepSeek client using OpenAI compatibility (only if API key exists)
let deepseek: OpenAI | null = null;
if (process.env.DEEPSEEK_API_KEY) {
  deepseek = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com/v1',
  });
}

export async function POST(request: NextRequest) {
  try {
    const { text, context = {} } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required for enhancement' },
        { status: 400 }
      );
    }

    // Check if AI service is available
    if (!deepseek) {
      return NextResponse.json(
        { error: 'AI service not configured. Please set up DEEPSEEK_API_KEY or use the free enhancement options.' },
        { status: 503 }
      );
    }

    // Create enhancement prompt based on context
    const prompt = createEnhancementPrompt(text, context);

    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are a professional resume writer expert in Harvard methodology. Transform simple, everyday language into sophisticated, professional resume content. Focus on:
          - Strong action verbs
          - Quantified achievements
          - Professional vocabulary
          - Results-oriented language
          - ATS-friendly formatting
          
          Always provide realistic, professional metrics when none are given. Return only the enhanced text without explanations.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const enhancedText = completion.choices[0]?.message?.content?.trim();

    if (!enhancedText) {
      throw new Error('No enhancement received from AI');
    }

    return NextResponse.json({
      success: true,
      original: text,
      enhanced: enhancedText,
      context: context
    });

  } catch (error: any) {
    console.error('AI Enhancement Error:', error);
    
    // Handle specific DeepSeek API errors
    if (error.status === 402) {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please check your API balance or try again later.' },
        { status: 402 }
      );
    }
    
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'AI service authentication failed. Please check API configuration.' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to enhance text. Please try again later.' },
      { status: 500 }
    );
  }
}

function createEnhancementPrompt(text: string, context: any): string {
  const { jobTitle, industry, experienceLevel } = context;
  
  let prompt = `Transform this simple job description into Harvard methodology-compliant professional language:\n\n"${text}"\n\n`;
  
  if (jobTitle) {
    prompt += `Job Title: ${jobTitle}\n`;
  }
  
  if (industry) {
    prompt += `Industry: ${industry}\n`;
  }
  
  if (experienceLevel) {
    prompt += `Experience Level: ${experienceLevel}\n`;
  }
  
  prompt += `\nGuidelines:
  - Use strong action verbs (managed, spearheaded, optimized, etc.)
  - Include realistic quantified results (percentages, numbers, timeframes)
  - Make it ATS-friendly and professional
  - Focus on achievements and impact
  - Keep it concise but impactful
  
  Transform the text above following these guidelines. If the original lacks specific numbers or outcomes, create realistic professional metrics that would be typical for this type of role.`;
  
  return prompt;
}