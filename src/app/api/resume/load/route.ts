import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database/connection';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const resumeId = searchParams.get('resumeId');

    if (!userId && !resumeId) {
      return NextResponse.json(
        { error: 'Either userId or resumeId is required' },
        { status: 400 }
      );
    }

    let query: string;
    let params: any[];

    if (resumeId) {
      // Load specific resume
      query = 'SELECT * FROM resumes WHERE id = ?';
      params = [resumeId];
    } else {
      // Load all resumes for user
      query = 'SELECT * FROM resumes WHERE user_id = ? ORDER BY updated_at DESC';
      params = [userId];
    }

    const resumes = await executeQuery(query, params) as any[];

    if (resumes.length === 0) {
      return NextResponse.json(
        { error: 'No resumes found' },
        { status: 404 }
      );
    }

    // Parse JSON data for each resume
    const parsedResumes = resumes.map(resume => ({
      ...resume,
      resume_data: JSON.parse(resume.resume_data)
    }));

    return NextResponse.json({
      success: true,
      resumes: resumeId ? parsedResumes[0] : parsedResumes
    });

  } catch (error) {
    console.error('Error loading resume:', error);
    return NextResponse.json(
      { error: 'Failed to load resume' },
      { status: 500 }
    );
  }
}
