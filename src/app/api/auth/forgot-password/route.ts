import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database/connection';
import { sendPasswordResetEmail, generateResetToken, getTokenExpiry } from '@/lib/email-service';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('Password reset requested for email:', email);

    // Check if user exists
    const users = await executeQuery(
      'SELECT id, first_name, email FROM users WHERE email = ?',
      [email]
    ) as any[];

    if (users.length === 0) {
      console.log('No user found with email:', email);
      return NextResponse.json(
        { success: false, error: 'No account found with this email address' },
        { status: 404 }
      );
    }

    const user = users[0];
    console.log('User found:', { id: user.id, email: user.email });

    // Generate reset token
    const resetToken = generateResetToken();
    const hashedToken = await bcrypt.hash(resetToken, 12);
    const tokenExpiry = getTokenExpiry();

    console.log('Generated reset token:', { 
      tokenStart: resetToken.substring(0, 12) + '...', 
      expiry: tokenExpiry 
    });
    console.log('Hashed token for storage:', hashedToken.substring(0, 10) + '...');

    // Store token in database
    await executeQuery(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [hashedToken, tokenExpiry, user.id]
    );

    console.log('Token stored in database for user:', user.id);

    // Send email
    const emailResult = await sendPasswordResetEmail(
      email, 
      resetToken, 
      user.first_name || 'User'
    );

    if (!emailResult.success) {
      console.error('Error sending password reset email:', emailResult.error);
      return NextResponse.json(
        { success: false, error: emailResult.error || 'Failed to send reset email' },
        { status: 500 }
      );
    }

    console.log('Email sent result:', emailResult.success);

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully'
    });

  } catch (error) {
    console.error('Error in forgot password endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
