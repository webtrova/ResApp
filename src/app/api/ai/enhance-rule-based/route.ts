import { NextRequest, NextResponse } from 'next/server';
import { enhanceText, enhanceMultipleTexts, generateSkillSuggestions, generateCareerSummary } from '@/lib/ai/rule-based-enhancer';

export async function POST(request: NextRequest) {
  try {
    const { text, texts, type, context = {} } = await request.json();

    // Handle different types of enhancement requests
    if (type === 'bulk' && texts && Array.isArray(texts)) {
      // Bulk enhancement
      const enhancedTexts = enhanceMultipleTexts(texts, context);
      
      return NextResponse.json({
        success: true,
        original: texts,
        enhanced: enhancedTexts,
        context: context,
        method: 'rule-based'
      });
    }

    if (type === 'skills' && context.jobTitle) {
      // Skill suggestions
      const suggestions = generateSkillSuggestions(context.jobTitle, context.industry || '');
      
      return NextResponse.json({
        success: true,
        type: 'skills',
        suggestions: suggestions,
        context: context,
        method: 'rule-based'
      });
    }

    if (type === 'summary' && context.jobTitle) {
      // Career summary generation
      const summary = generateCareerSummary(
        context.jobTitle,
        context.yearsExperience || 3,
        context.keySkills || [],
        context.industry || ''
      );
      
      return NextResponse.json({
        success: true,
        type: 'summary',
        suggestions: summary,
        context: context,
        method: 'rule-based'
      });
    }

    // Single text enhancement (default)
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required for enhancement' },
        { status: 400 }
      );
    }

    const enhancedText = enhanceText(text, context);

    return NextResponse.json({
      success: true,
      original: text,
      enhanced: enhancedText,
      context: context,
      method: 'rule-based'
    });

  } catch (error: any) {
    console.error('Rule-based Enhancement Error:', error);
    
    return NextResponse.json(
      { error: 'Failed to enhance text. Please try again later.' },
      { status: 500 }
    );
  }
}
