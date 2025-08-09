import { NextRequest, NextResponse } from 'next/server';
import { autoDeleteOldEvents } from '@/app/actions/event-actions';

export async function POST(request: NextRequest) {
  try {
    // Verificar se é uma chamada autorizada (você pode adicionar autenticação aqui)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Executar a limpeza automática
    const result = await autoDeleteOldEvents();
    
    if (result.success) {
      console.log(`Cron job: Auto-deleted ${result.deletedCount} old events`);
      return NextResponse.json({
        success: true,
        message: `Successfully deleted ${result.deletedCount} old events`,
        deletedCount: result.deletedCount,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('Cron job: Failed to delete old events:', result.error);
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Cron job: Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Também permitir GET para testes
export async function GET() {
  try {
    const result = await autoDeleteOldEvents();
    
    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? `Successfully deleted ${result.deletedCount} old events`
        : result.error,
      deletedCount: result.deletedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 

    