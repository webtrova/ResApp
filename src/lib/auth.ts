import jwt from 'jsonwebtoken';
import { executeQuery } from '@/lib/database/connection';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthUser {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if session exists in database
    const sessions = await executeQuery(
      'SELECT user_id FROM user_sessions WHERE token = ? AND expires_at > NOW()',
      [token]
    ) as any[];

    if (sessions.length === 0) {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      firstName: decoded.firstName,
      lastName: decoded.lastName
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
