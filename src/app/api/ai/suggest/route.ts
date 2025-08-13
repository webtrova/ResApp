import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize DeepSeek client using OpenAI compatibility
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

export async function POST(request: NextRequest) {
  try {
    const { type, context = {} } = await request.json();

    if (!type) {
      return NextResponse.json(
        { error: 'Suggestion type is required' },
        { status: 400 }
      );
    }

    let prompt = '';
    let systemMessage = '';

    switch (type) {
      case 'skills':
        systemMessage = 'You are a career expert. Suggest relevant professional skills based on job title and experience.';
        prompt = createSkillsSuggestionPrompt(context);
        break;
      
      case 'summary':
        systemMessage = 'You are a professional resume writer. Create compelling career summaries.';
        prompt = createSummaryPrompt(context);
        break;
      
      case 'achievements':
        systemMessage = 'You are a resume expert. Suggest professional achievements and accomplishments.';
        prompt = createAchievementsPrompt(context);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid suggestion type' },
          { status: 400 }
        );
    }

    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 400,
    });

    const suggestion = completion.choices[0]?.message?.content?.trim();

    if (!suggestion) {
      throw new Error('No suggestion received from AI');
    }

    // Parse the response based on type
    let parsedSuggestion;
    
    if (type === 'skills') {
      // Extract skills as array
      parsedSuggestion = suggestion
        .split(/[,\n]/)
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0)
        .slice(0, 10); // Limit to 10 skills
    } else if (type === 'achievements') {
      // Extract achievements as bullet points
      parsedSuggestion = suggestion
        .split(/[•\-\n]/)
        .map(achievement => achievement.trim())
        .filter(achievement => achievement.length > 10)
        .slice(0, 6); // Limit to 6 achievements
    } else {
      parsedSuggestion = suggestion;
    }

    return NextResponse.json({
      success: true,
      type,
      suggestions: parsedSuggestion,
      context
    });

  } catch (error: any) {
    console.error('AI Suggestion Error:', error);
    
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
      { error: 'Failed to generate suggestions. Please try again later.' },
      { status: 500 }
    );
  }
}

function createSkillsSuggestionPrompt(context: any): string {
  const { jobTitle, industry, experienceLevel } = context;
  
  return `Suggest 8-10 relevant professional skills for this profile:

Job Title: ${jobTitle || 'Professional'}
Industry: ${industry || 'General'}
Experience Level: ${experienceLevel || 'Mid-level'}

Include a mix of:
- Technical skills relevant to the role
- Soft skills valued by employers
- Industry-specific competencies
- Leadership and communication skills

Format as a simple comma-separated list. Focus on skills that are:
- In-demand and valuable
- Relevant to the job title and industry
- Appropriate for the experience level
- ATS-friendly and commonly searched

Example format: JavaScript, Project Management, Team Leadership, Data Analysis`;
}

function createSummaryPrompt(context: any): string {
  const { jobTitle, yearsExperience, keySkills, industry } = context;
  
  return `Create a compelling 2-3 sentence professional summary for:

Job Title: ${jobTitle || 'Professional'}
Years of Experience: ${yearsExperience || '3-5'}
Key Skills: ${keySkills?.join(', ') || 'Various professional skills'}
Industry: ${industry || 'General'}

The summary should:
- Start with a strong professional identifier
- Highlight years of experience and key expertise
- Include 1-2 specific achievements or strengths
- End with career goals or value proposition
- Be concise, professional, and ATS-friendly
- Use action-oriented language

Write in third person without using "I" statements.`;
}

function createAchievementsPrompt(context: any): string {
  const { jobTitle, companyName, responsibilities } = context;
  
  return `Suggest 4-6 professional achievements for this role:

Job Title: ${jobTitle || 'Professional'}
Company: ${companyName || 'Previous Company'}
Responsibilities: ${responsibilities || 'Various professional duties'}

Create realistic, quantified achievements that show:
- Leadership and initiative
- Process improvements and efficiency gains
- Team collaboration and results
- Problem-solving capabilities
- Measurable impact (percentages, numbers, timeframes)

Format as bullet points starting with strong action verbs. Each achievement should:
- Begin with a powerful action verb
- Include specific, realistic metrics
- Show clear business impact
- Be relevant to the role and industry

Example format:
• Spearheaded cross-functional project resulting in 25% efficiency improvement
• Mentored team of 8 junior staff, reducing onboarding time by 30%`;
}