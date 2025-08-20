import { NextRequest, NextResponse } from 'next/server';
import { EnhancedResumeParser } from '@/lib/parsing/enhanced-resume-parser';

export async function POST(request: NextRequest) {
  try {
    const { text, fileName, fileType } = await request.json();
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Resume text is required for parsing' },
        { status: 400 }
      );
    }

    const parser = new EnhancedResumeParser();
    const result = parser.parseResumeText(text);
    
    return NextResponse.json({
      success: true,
      data: result,
      fileName: fileName || 'resume',
      fileType: fileType || 'text'
    });
    
  } catch (error) {
    console.error('Enhanced parsing error:', error);
    return NextResponse.json(
      { error: 'Failed to parse resume' }, 
      { status: 500 }
    );
  }
}
