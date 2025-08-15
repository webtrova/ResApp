import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate environment variables
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!gmailUser || !gmailPassword || !appUrl) {
      console.error('Missing environment variables:', {
        gmailUser: !!gmailUser,
        gmailPassword: !!gmailPassword,
        appUrl: !!appUrl
      });
      return {
        success: false,
        error: 'Email service configuration is incomplete. Please check environment variables.'
      };
    }

    // Create transporter with better error handling
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword
      }
    });

    // Verify connection configuration
    try {
      await transporter.verify();
      console.log('Email transporter verified successfully');
    } catch (verifyError) {
      console.error('Email transporter verification failed:', verifyError);
      return {
        success: false,
        error: 'Email service configuration is invalid. Please check Gmail credentials.'
      };
    }

    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;
    
    console.log('=== EMAIL SERVICE DEBUG ===');
    console.log('Generated reset URL:', resetUrl);
    console.log('Full appUrl:', appUrl);
    console.log('Reset token:', resetToken);
    console.log('Environment variables:', {
      gmailUser: !!gmailUser,
      gmailPassword: !!gmailPassword,
      appUrl: appUrl
    });
    console.log('=== END EMAIL SERVICE DEBUG ===');

    const mailOptions = {
      from: `"resApp" <${gmailUser}>`,
      to: email,
      subject: 'Reset Your resApp Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your resApp Password</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              width: 120px;
              height: auto;
              margin-bottom: 20px;
            }
            .title {
              color: #1a202c;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .subtitle {
              color: #718096;
              font-size: 16px;
            }
            .content {
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #f97316, #ea580c);
              color: white;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              margin: 20px 0;
              text-align: center;
            }
            .button:hover {
              background: linear-gradient(135deg, #ea580c, #dc2626);
            }
            .warning {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 8px;
              padding: 16px;
              margin: 20px 0;
              color: #92400e;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              color: #718096;
              font-size: 14px;
            }
            .link {
              color: #f97316;
              text-decoration: none;
            }
            .link:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${appUrl}/logo_white.png" alt="resApp Logo" class="logo">
              <h1 class="title">Reset Your Password</h1>
              <p class="subtitle">Hello ${userName}, we received a request to reset your password.</p>
            </div>
            
            <div class="content">
              <p>Click the button below to reset your password. This link will expire in 1 hour for security reasons.</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <div class="warning">
                <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p><a href="${resetUrl}" class="link">${resetUrl}</a></p>
            </div>
            
            <div class="footer">
              <p>This email was sent from resApp - Your AI-Powered Resume Builder</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    console.log('Attempting to send email to:', email);
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    
    // Provide specific error messages based on the error type
    let errorMessage = 'Failed to send password reset email.';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Gmail authentication failed. Please check your Gmail App Password.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Unable to connect to Gmail servers. Please try again later.';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Email service timeout. Please try again later.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

export function generateResetToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function getTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 1); // Token expires in 1 hour
  return expiry;
}
