import { NextRequest, NextResponse } from 'next/server';
import { enhanceTradeText } from '@/lib/trades-enhancer';

export async function POST(request: NextRequest) {
  try {
    const { text, trade } = await request.json();
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required for enhancement' },
        { status: 400 }
      );
    }

    const result = enhanceTradeText(text, trade || 'general');
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Trades enhancement error:', error);
    return NextResponse.json(
      { error: 'Enhancement failed' }, 
      { status: 500 }
    );
  }
}
