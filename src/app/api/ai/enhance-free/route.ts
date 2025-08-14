import { NextRequest, NextResponse } from 'next/server';
import { aiServiceManager } from '@/lib/ai/ai-service-manager';

export async function POST(request: NextRequest) {
  try {
    const { text, texts, type, context = {} } = await request.json();

    // Initialize AI services if not already done
    await aiServiceManager.initialize();

    // Handle different types of enhancement requests
    if (type === 'bulk' && texts && Array.isArray(texts)) {
      // Bulk enhancement
      const enhancedTexts = await aiServiceManager.enhanceMultipleTexts(texts, context);
      
      return NextResponse.json({
        success: true,
        original: texts,
        enhanced: enhancedTexts,
        context: context,
        method: 'unified-ai-manager',
        availableServices: aiServiceManager.getAvailableServices()
      });
    }

    if (type === 'skills' && context.jobTitle) {
      // Skill suggestions
      const suggestions = await aiServiceManager.generateSkillSuggestions(
        context.jobTitle, 
        context.industry || ''
      );
      
      return NextResponse.json({
        success: true,
        type: 'skills',
        suggestions: suggestions,
        context: context,
        method: 'unified-ai-manager',
        availableServices: aiServiceManager.getAvailableServices()
      });
    }

    if (type === 'summary' && context.jobTitle) {
      // Career summary generation
      const summary = await aiServiceManager.generateCareerSummary(
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
        method: 'unified-ai-manager',
        availableServices: aiServiceManager.getAvailableServices()
      });
    }

    if (type === 'test') {
      // Test all available services
      const testResults = await aiServiceManager.testServices();
      
      return NextResponse.json({
        success: true,
        type: 'test',
        results: testResults,
        availableServices: aiServiceManager.getAvailableServices(),
        method: 'unified-ai-manager'
      });
    }

    // Single text enhancement (default)
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required for enhancement' },
        { status: 400 }
      );
    }

    const enhancedText = await aiServiceManager.enhanceText(text, context);

    return NextResponse.json({
      success: true,
      original: text,
      enhanced: enhancedText,
      context: context,
      method: 'unified-ai-manager',
      availableServices: aiServiceManager.getAvailableServices()
    });

  } catch (error: any) {
    console.error('Unified AI Enhancement Error:', error);
    
    return NextResponse.json(
      { error: 'Failed to enhance text. Please try again later.' },
      { status: 500 }
    );
  }
}

// GET endpoint to check service status
export async function GET(request: NextRequest) {
  try {
    await aiServiceManager.initialize();
    
    const status = aiServiceManager.getServiceStatus();
    const availableServices = aiServiceManager.getAvailableServices();
    
    return NextResponse.json({
      success: true,
      status,
      availableServices,
      method: 'unified-ai-manager'
    });
  } catch (error) {
    console.error('Service status check failed:', error);
    
    return NextResponse.json(
      { error: 'Failed to check service status' },
      { status: 500 }
    );
  }
}
