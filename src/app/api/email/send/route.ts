import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { 
      to, 
      subject, 
      body, 
      resumeData, 
      coverLetterData,
      resumeFormat = 'docx',
      coverLetterFormat = 'docx'
    } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'To, subject, and body are required' },
        { status: 400 }
      );
    }

    // Generate download URLs for the documents
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Create mailto link with subject and body
    const mailtoUrl = new URL('mailto:' + to);
    mailtoUrl.searchParams.set('subject', subject);
    mailtoUrl.searchParams.set('body', body);
    
    // Add attachment information in the body
    const attachmentInfo = `
    
---
Documents attached:
- Resume (${resumeFormat.toUpperCase()})
- Cover Letter (${coverLetterFormat.toUpperCase()})

To download these documents, visit:
- Resume: ${baseUrl}/api/resume/download
- Cover Letter: ${baseUrl}/api/cover-letter/download

Note: Please download and attach these documents to your email before sending.
    `;
    
    mailtoUrl.searchParams.set('body', body + attachmentInfo);

    return NextResponse.json({
      success: true,
      mailtoUrl: mailtoUrl.toString(),
      message: 'Email client will open with your message. Please attach the documents manually.',
      downloadUrls: {
        resume: `${baseUrl}/api/resume/download`,
        coverLetter: `${baseUrl}/api/cover-letter/download`
      }
    });

  } catch (error) {
    console.error('Error preparing email:', error);
    return NextResponse.json(
      { error: 'Failed to prepare email' },
      { status: 500 }
    );
  }
}
