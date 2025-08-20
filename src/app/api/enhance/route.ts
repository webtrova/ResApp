import { NextRequest, NextResponse } from 'next/server';
import { KeywordBank } from '@/lib/content/keyword-bank';

export async function POST(request: NextRequest) {
  try {
    const { text, industry, level, type } = await request.json();
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    
    const keywordBank = new KeywordBank();
    
    if (type === 'search') {
      // Keyword search functionality
      const results = keywordBank.searchKeywords(text, industry);
      return NextResponse.json({
        success: true,
        type: 'search',
        query: text,
        results
      });
    }
    
    if (type === 'quantify') {
      // Get quantification suggestions
      const suggestions = keywordBank.getQuantificationSuggestions(industry || 'general', text);
      return NextResponse.json({
        success: true,
        type: 'quantification',
        suggestions
      });
    }
    
    // Default: text enhancement
    const result = keywordBank.enhanceText(text, industry || 'general', level || 'entry');
    
    // Get quantification options for this industry
    const quantificationOptions = keywordBank.getQuantificationSuggestions(industry || 'general', text);
    
    return NextResponse.json({
      success: true,
      type: 'enhancement',
      original: text,
      enhanced: result.enhanced,
      improvements: result.improvements,
      suggestions: result.suggestions,
      quantificationOptions,
      detectedIndustry: industry || 'general'
    });
    
  } catch (error) {
    console.error('Enhancement error:', error);
    return NextResponse.json(
      { error: 'Enhancement failed. Please try again.' }, 
      { status: 500 }
    );
  }
}
