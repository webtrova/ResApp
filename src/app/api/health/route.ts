import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/database/connection';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Check database health
    const dbHealthy = await checkDatabaseHealth();
    
    const responseTime = Date.now() - startTime;
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbHealthy ? 'connected' : 'disconnected',
        responseTime: `${responseTime}ms`
      },
      services: {
        ruleBasedEnhancement: 'available',
        aiEnhancement: process.env.DEEPSEEK_API_KEY ? 'available' : 'unavailable',
        fileProcessing: 'available'
      },
      version: process.env.npm_package_version || '1.0.0'
    };

    if (!dbHealthy) {
      healthStatus.status = 'degraded';
      return NextResponse.json(healthStatus, { status: 503 });
    }

    return NextResponse.json(healthStatus);
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      environment: process.env.NODE_ENV || 'development'
    }, { status: 500 });
  }
}
