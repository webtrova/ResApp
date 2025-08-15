import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database/connection';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    console.log('Reset password request:', { token: token?.substring(0, 10) + '...', passwordLength: password?.length });

    if (!token || !password) {
      console.log('Missing token or password');
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      console.log('Password too short');
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Find user with valid reset token
    const currentTime = new Date();
    console.log('Current time for comparison:', currentTime);
    
    const users = await executeQuery(
      'SELECT id, reset_token, reset_token_expires FROM users WHERE reset_token IS NOT NULL AND reset_token_expires > ?',
      [currentTime]
    ) as any[];

    console.log('Found users with valid tokens:', users.length);
    
    // Let's also check all users with any reset tokens (including expired ones)
    const allUsersWithTokens = await executeQuery(
      'SELECT id, reset_token, reset_token_expires FROM users WHERE reset_token IS NOT NULL',
      []
    ) as any[];
    
    console.log('All users with any reset tokens:', allUsersWithTokens.length);
    
    if (allUsersWithTokens.length > 0) {
      console.log('Token details:', allUsersWithTokens.map(u => ({
        userId: u.id,
        hasToken: !!u.reset_token,
        tokenStart: u.reset_token?.substring(0, 10) + '...',
        expires: u.reset_token_expires,
        isExpired: u.reset_token_expires < new Date()
      })));
    }

    const user = users.find(u => {
      const isValid = bcrypt.compareSync(token, u.reset_token);
      console.log('Token comparison:', { 
        userId: u.id, 
        tokenMatch: isValid,
        storedTokenStart: u.reset_token?.substring(0, 10) + '...',
        providedTokenStart: token?.substring(0, 10) + '...'
      });
      return isValid;
    });

    if (!user) {
      console.log('No valid user found for token');
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    console.log('Valid user found, updating password for user:', user.id);

    // Get user email for login
    const userData = await executeQuery(
      'SELECT email FROM users WHERE id = ?',
      [user.id]
    ) as any[];

    const userEmail = userData[0]?.email;

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password and clear reset token
    await executeQuery(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    console.log('Password updated successfully');

    return NextResponse.json(
      { 
        success: true, 
        message: 'Password reset successfully',
        email: userEmail 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
