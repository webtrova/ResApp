import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database/connection';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
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

    const { coverLetterId } = await request.json();

    if (!coverLetterId) {
      return NextResponse.json(
        { error: 'Cover letter ID is required' },
        { status: 400 }
      );
    }

    // Verify the cover letter belongs to the authenticated user
    const coverLetterCheck = await executeQuery(
      'SELECT id FROM cover_letters WHERE id = ? AND user_id = ?',
      [coverLetterId, user.userId]
    ) as any[];

    if (coverLetterCheck.length === 0) {
      return NextResponse.json(
        { error: 'Cover letter not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the cover letter
    await executeQuery(
      'DELETE FROM cover_letters WHERE id = ? AND user_id = ?',
      [coverLetterId, user.userId]
    );

    return NextResponse.json({
      success: true,
      message: 'Cover letter deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting cover letter:', error);
    return NextResponse.json(
      { error: 'Failed to delete cover letter' },
      { status: 500 }
    );
  }
}
