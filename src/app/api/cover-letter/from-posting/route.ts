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
    const { resumeData, jobPosting, companyName, jobTitle, tone } = body;

    // Validate required fields
    if (!resumeData || !jobPosting || !companyName || !jobTitle) {
      return NextResponse.json(
        { error: 'Resume data, job posting, company name, and job title are required' },
        { status: 400 }
      );
    }

    // Generate cover letter from job posting
    const coverLetterData = await coverLetterService.generateFromJobPosting(
      resumeData,
      jobPosting,
      companyName,
      jobTitle,
      tone || 'professional'
    );

    return NextResponse.json({
      success: true,
      coverLetter: coverLetterData
    });

  } catch (error) {
    console.error('Error generating cover letter from posting:', error);
    return NextResponse.json(
      { error: 'Failed to generate cover letter from job posting' },
      { status: 500 }
    );
  }
}
