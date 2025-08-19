import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // For JWT-based authentication, we can either:
    // 1. Simply return success (since JWT tokens are stateless)
    // 2. Verify the token first to ensure it's valid before "logging out"
    
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify the token is valid before confirming logout
    try {
      await verifyToken(token);
      console.log('Valid token provided for logout');
    } catch (error) {
      console.log('Invalid token provided for logout, but allowing logout anyway');
      // We still allow logout even with invalid tokens to clear client state
    }

    // Since we're using stateless JWT tokens, logout is handled client-side
    // by removing the token from localStorage. The server doesn't need to 
    // track active sessions, so we just return success.
    
    return NextResponse.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
