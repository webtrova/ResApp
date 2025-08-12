import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database/connection';

export async function DELETE(request: NextRequest) {
  try {
    const { resumeId } = await request.json();

    if (!resumeId) {
      return NextResponse.json(
        { error: 'Resume ID is required' },
        { status: 400 }
      );
    }

    // Check if resume exists
    const resumeCheck = await executeQuery(
      'SELECT id FROM resumes WHERE id = ?',
      [resumeId]
    ) as any[];

    if (resumeCheck.length === 0) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    // Delete the resume
    await executeQuery(
      'DELETE FROM resumes WHERE id = ?',
      [resumeId]
    );

    return NextResponse.json({
      success: true,
      message: 'Resume deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting resume:', error);
    return NextResponse.json(
      { error: 'Failed to delete resume' },
      { status: 500 }
    );
  }
}
