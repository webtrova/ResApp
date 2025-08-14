import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize DeepSeek client using OpenAI compatibility
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

// Industry-specific default metrics
const INDUSTRY_DEFAULTS: Record<string, any> = {
  'software_engineering': {
    teamSize: '5-8 members',
    efficiency: '15-25%',
    projectScope: 'multiple features',
    timeframe: 'quarterly',
    metrics: ['code quality', 'deployment frequency', 'bug reduction']
  },
  'sales': {
    clientBase: '50+ clients',
    revenue: '20-30%',
    targets: 'exceeded quotas',
    timeframe: 'monthly/quarterly',
    metrics: ['revenue growth', 'client acquisition', 'deal size']
  },
  'marketing': {
    reach: '10K+ audience',
    engagement: '25-40%',
    conversion: '15-25%',
    timeframe: 'monthly',
    metrics: ['campaign performance', 'lead generation', 'brand awareness']
  },
  'customer_service': {
    volume: '100+ daily interactions',
    satisfaction: '95%+',
    resolution: 'first-call resolution',
    timeframe: 'daily/weekly',
    metrics: ['customer satisfaction', 'response time', 'resolution rate']
  },
  'project_management': {
    teamSize: '8-15 members',
    budget: '$100K-$500K',
    timeline: '6-12 months',
    timeframe: 'project lifecycle',
    metrics: ['on-time delivery', 'budget adherence', 'stakeholder satisfaction']
  },
  'finance': {
    portfolio: '$1M-$10M',
    returns: '8-15%',
    risk: 'managed risk',
    timeframe: 'quarterly/annually',
    metrics: ['portfolio performance', 'risk management', 'compliance']
  },
  'healthcare': {
    patients: '50-200 patients',
    outcomes: 'improved outcomes',
    efficiency: '20-30%',
    timeframe: 'monthly',
    metrics: ['patient outcomes', 'efficiency gains', 'quality metrics']
  },
  'education': {
    students: '25-100 students',
    performance: '15-25% improvement',
    engagement: 'increased engagement',
    timeframe: 'semester/academic year',
    metrics: ['student performance', 'engagement rates', 'learning outcomes']
  }
};

export async function POST(request: NextRequest) {
  try {
    const { text, context = {} } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required for enhancement' },
        { status: 400 }
      );
    }

    // Extract context information
    const {
      jobTitle = '',
      industry = '',
      experienceLevel = 'mid',
      companySize = 'medium',
      bulkMode = false,
      itemIndex = 0,
      totalItems = 1
    } = context;

    // Determine industry defaults
    const industryKey = getIndustryKey(industry, jobTitle);
    const defaults = INDUSTRY_DEFAULTS[industryKey as keyof typeof INDUSTRY_DEFAULTS] || INDUSTRY_DEFAULTS['project_management'];

    // Create enhanced prompt with smart quantification
    const prompt = createQuantifiedEnhancementPrompt(text, {
      jobTitle,
      industry,
      experienceLevel,
      companySize,
      defaults,
      bulkMode,
      itemIndex,
      totalItems
    });

    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are an expert resume writer specializing in Harvard methodology and quantified achievements. Your goal is to transform simple job descriptions into powerful, results-oriented bullet points.

Key Principles:
1. ALWAYS include specific, realistic numbers and percentages
2. Use strong action verbs from Harvard's approved list
3. Follow PAR structure: Problem-Action-Result
4. Make achievements sound impressive but believable
5. Tailor language to the specific industry and role level
6. Focus on impact and outcomes, not just responsibilities

When quantifying:
- Use industry-appropriate metrics and timeframes
- Provide realistic ranges based on role level and company size
- Include both hard numbers (percentages, dollar amounts) and soft metrics (improvements, efficiencies)
- Ensure all numbers are contextually appropriate

Return only the enhanced text without explanations or formatting.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const enhancedText = completion.choices[0]?.message?.content?.trim();

    if (!enhancedText) {
      throw new Error('No enhancement received from AI');
    }

    return NextResponse.json({
      success: true,
      original: text,
      enhanced: enhancedText,
      context: context,
      industry: industryKey,
      quantification: extractQuantification(enhancedText)
    });

  } catch (error: any) {
    console.error('AI Quantified Enhancement Error:', error);
    
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

function getIndustryKey(industry: string, jobTitle: string): string {
  const industryLower = industry.toLowerCase();
  const jobTitleLower = jobTitle.toLowerCase();

  // Map industries and job titles to our default categories
  if (industryLower.includes('software') || industryLower.includes('tech') || 
      jobTitleLower.includes('developer') || jobTitleLower.includes('engineer')) {
    return 'software_engineering';
  }
  
  if (industryLower.includes('sales') || jobTitleLower.includes('sales')) {
    return 'sales';
  }
  
  if (industryLower.includes('marketing') || jobTitleLower.includes('marketing')) {
    return 'marketing';
  }
  
  if (industryLower.includes('customer') || industryLower.includes('support') ||
      jobTitleLower.includes('customer') || jobTitleLower.includes('support')) {
    return 'customer_service';
  }
  
  if (industryLower.includes('project') || jobTitleLower.includes('project')) {
    return 'project_management';
  }
  
  if (industryLower.includes('finance') || industryLower.includes('accounting') ||
      jobTitleLower.includes('finance') || jobTitleLower.includes('accountant')) {
    return 'finance';
  }
  
  if (industryLower.includes('health') || industryLower.includes('medical') ||
      jobTitleLower.includes('nurse') || jobTitleLower.includes('doctor')) {
    return 'healthcare';
  }
  
  if (industryLower.includes('education') || industryLower.includes('teaching') ||
      jobTitleLower.includes('teacher') || jobTitleLower.includes('professor')) {
    return 'education';
  }

  return 'project_management'; // Default fallback
}

function createQuantifiedEnhancementPrompt(text: string, context: any): string {
  const {
    jobTitle,
    industry,
    experienceLevel,
    companySize,
    defaults,
    bulkMode,
    itemIndex,
    totalItems
  } = context;

  let prompt = `Transform this job description into a quantified, Harvard methodology-compliant bullet point:\n\n"${text}"\n\n`;

  // Add context information
  if (jobTitle) prompt += `Job Title: ${jobTitle}\n`;
  if (industry) prompt += `Industry: ${industry}\n`;
  if (experienceLevel) prompt += `Experience Level: ${experienceLevel}\n`;
  if (companySize) prompt += `Company Size: ${companySize}\n`;

  // Add industry-specific guidance
  prompt += `\nIndustry Context: ${industry}\n`;
  prompt += `Typical metrics for this role: ${defaults.metrics.join(', ')}\n`;
  prompt += `Realistic timeframes: ${defaults.timeframe}\n`;

  // Add quantification guidelines
  prompt += `\nQuantification Guidelines:
- Include specific numbers: percentages (15-30%), dollar amounts, team sizes, timeframes
- Use realistic metrics: ${defaults.metrics.join(', ')}
- Focus on impact: "resulting in", "leading to", "achieving"
- Use strong action verbs: Led, Developed, Optimized, Spearheaded, Orchestrated
- Follow PAR structure: Problem-Action-Result
- Keep it concise but impactful (1-2 lines maximum)

Examples of good quantified achievements:
- "Led cross-functional team of ${defaults.teamSize}, resulting in ${defaults.efficiency} efficiency improvement"
- "Managed ${defaults.projectScope} projects, achieving ${defaults.timeframe} delivery targets"
- "Optimized processes to reduce costs by 20% while maintaining quality standards"

Transform the text above following these guidelines. If the original lacks specific numbers, create realistic professional metrics that would be typical for this type of role and experience level.`;

  if (bulkMode) {
    prompt += `\n\nNote: This is item ${itemIndex + 1} of ${totalItems} in a bulk enhancement process. Ensure consistency with other items.`;
  }

  return prompt;
}

function extractQuantification(text: string): any {
  const numbers = text.match(/\d+(?:\.\d+)?%?/g) || [];
  const percentages = text.match(/\d+(?:\.\d+)?%/g) || [];
  const dollarAmounts = text.match(/\$\d+(?:,\d{3})*(?:\.\d{2})?/g) || [];
  
  return {
    numbers: numbers,
    percentages: percentages,
    dollarAmounts: dollarAmounts,
    hasQuantification: numbers.length > 0
  };
}
