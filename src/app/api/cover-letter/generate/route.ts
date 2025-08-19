import { NextRequest, NextResponse } from 'next/server';
import { coverLetterService } from '../../../../lib/ai/cover-letter-service';
import { CoverLetterGenerationRequest } from '../../../../types/resume';
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
    const { resumeData, jobDetails, tone, focus, length } = body as CoverLetterGenerationRequest;

    // Validate required fields
    if (!resumeData || !jobDetails) {
      return NextResponse.json(
        { error: 'Resume data and job details are required' },
        { status: 400 }
      );
    }

    if (!jobDetails.companyName || !jobDetails.jobTitle) {
      return NextResponse.json(
        { error: 'Company name and job title are required' },
        { status: 400 }
      );
    }

    // Generate cover letter
    const coverLetterData = await coverLetterService.generateCoverLetter({
      resumeData,
      jobDetails,
      tone: tone || 'professional',
      focus: focus || 'balanced',
      length: length || 'standard'
    });

    return NextResponse.json({
      success: true,
      coverLetter: coverLetterData
    });

  } catch (error) {
    console.error('Error generating cover letter:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'N/A');
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: 'Failed to generate cover letter', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
