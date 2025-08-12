import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database/connection';
import { ResumeData } from '@/types/resume';

export async function POST(request: NextRequest) {
  try {
    const { userId, resumeData, title = 'My Resume' } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!resumeData) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userCheck = await executeQuery(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    ) as any[];

    if (userCheck.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Insert new resume
    const result = await executeQuery(
      'INSERT INTO resumes (user_id, title, resume_data, is_complete) VALUES (?, ?, ?, ?)',
      [userId, title, JSON.stringify(resumeData), false]
    ) as any;

    const resumeId = result.insertId;

    return NextResponse.json({
      success: true,
      resumeId,
      message: 'Resume saved successfully'
    });

  } catch (error) {
    console.error('Error saving resume:', error);
    return NextResponse.json(
      { error: 'Failed to save resume' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { resumeId, resumeData, title, isComplete = false } = await request.json();

    if (!resumeId) {
      return NextResponse.json(
        { error: 'Resume ID is required' },
        { status: 400 }
      );
    }

    if (!resumeData) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      );
    }

    // Update existing resume
    await executeQuery(
      'UPDATE resumes SET title = ?, resume_data = ?, is_complete = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, JSON.stringify(resumeData), isComplete, resumeId]
    );

    return NextResponse.json({
      success: true,
      message: 'Resume updated successfully'
    });

  } catch (error) {
    console.error('Error updating resume:', error);
    return NextResponse.json(
      { error: 'Failed to update resume' },
      { status: 500 }
    );
  }
}
