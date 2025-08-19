import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database/connection';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const coverLetterId = searchParams.get('coverLetterId');

    if (!userId && !coverLetterId) {
      return NextResponse.json(
        { error: 'Either userId or coverLetterId is required' },
        { status: 400 }
      );
    }

    let query: string;
    let params: any[];

    if (coverLetterId) {
      // Load specific cover letter
      query = 'SELECT * FROM cover_letters WHERE id = ? AND user_id = ?';
      params = [coverLetterId, user.userId];
    } else {
      // Load all cover letters for user
      query = 'SELECT * FROM cover_letters WHERE user_id = ? ORDER BY updated_at DESC';
      params = [userId];
    }

    const coverLetters = await executeQuery(query, params) as any[];

    if (coverLetters.length === 0) {
      return NextResponse.json(
        { error: 'No cover letters found' },
        { status: 404 }
      );
    }

    // Parse JSON data for each cover letter
    const parsedCoverLetters = coverLetters.map(coverLetter => ({
      ...coverLetter,
      cover_letter_data: JSON.parse(coverLetter.cover_letter_data)
    }));

    if (coverLetterId) {
      return NextResponse.json({
        success: true,
        coverLetter: parsedCoverLetters[0]
      });
    } else {
      return NextResponse.json({
        success: true,
        coverLetters: parsedCoverLetters
      });
    }

  } catch (error) {
    console.error('Error loading cover letters:', error);
    return NextResponse.json(
      { error: 'Failed to load cover letters' },
      { status: 500 }
    );
  }
}
