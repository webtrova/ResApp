import { NextRequest, NextResponse } from 'next/server';
import { coverLetterService } from '../../../../lib/ai/cover-letter-service';
import { verifyToken, extractTokenFromHeader } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader || '');
    
    if (!token) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const body = await request.json();
    const { content, context } = body;

    // Validate required fields
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Enhance cover letter content
    const enhancedContent = await coverLetterService.enhanceCoverLetterContent(content, context || {});

    return NextResponse.json({
      success: true,
      enhancedContent
    });

  } catch (error) {
    console.error('Error enhancing cover letter content:', error);
    return NextResponse.json(
      { error: 'Failed to enhance cover letter content' },
      { status: 500 }
    );
  }
}
