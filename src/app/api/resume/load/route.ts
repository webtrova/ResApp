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
      // Load specific resume and its upload data
      query = `
        SELECT r.*, ru.optimization_results, ru.confidence_score, ru.original_filename, ru.file_type
        FROM resumes r
        LEFT JOIN resume_uploads ru ON r.user_id = ru.user_id AND r.title LIKE CONCAT('%', ru.original_filename, '%')
        WHERE r.id = ?
      `;
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
      resume_data: JSON.parse(resume.resume_data),
      optimization_results: resume.optimization_results ? JSON.parse(resume.optimization_results) : null
    }));

    if (resumeId) {
      const resume = parsedResumes[0];
      return NextResponse.json({
        success: true,
        resume: resume,
        uploadData: {
          optimization_results: resume.optimization_results,
          confidence_score: resume.confidence_score,
          original_filename: resume.original_filename,
          file_type: resume.file_type
        }
      });
    } else {
      return NextResponse.json({
        success: true,
        resumes: parsedResumes
      });
    }

  } catch (error) {
    console.error('Error loading resume:', error);
    return NextResponse.json(
      { error: 'Failed to load resume' },
      { status: 500 }
    );
  }
}
