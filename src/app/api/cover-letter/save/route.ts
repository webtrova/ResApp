import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '../../../../lib/auth';
import { CoverLetterData } from '../../../../types/resume';
import { executeQuery } from '../../../../lib/database/connection';

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
    const { title, coverLetterData } = body;

    // Validate required fields
    if (!title || !coverLetterData) {
      return NextResponse.json(
        { error: 'Title and cover letter data are required' },
        { status: 400 }
      );
    }

    const userId = user.userId;

    // Save cover letter to database
    const result = await executeQuery(
      `INSERT INTO cover_letters (user_id, title, cover_letter_data, is_complete, created_at, updated_at) 
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [userId, title, JSON.stringify(coverLetterData), true]
    );

    const coverLetterId = (result as any).insertId;

    return NextResponse.json({
      success: true,
      coverLetterId,
      message: 'Cover letter saved successfully'
    });

  } catch (error) {
    console.error('Error saving cover letter:', error);
    return NextResponse.json(
      { error: 'Failed to save cover letter' },
      { status: 500 }
    );
  }
}
