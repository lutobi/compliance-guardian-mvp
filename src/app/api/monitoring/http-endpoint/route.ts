import { NextResponse } from 'next/server';
import { HttpEndpointIntegration } from '@/services/integrations/HttpEndpointIntegration';

export const runtime = 'nodejs';

const integration = new HttpEndpointIntegration();

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json();
    switch (action) {
      case 'validate': {
        const validation = await integration.validateConfig(data);
        return NextResponse.json(validation, { status: validation.valid ? 200 : 400 });
      }
      case 'configure': {
        await integration.configure(data);
        return NextResponse.json({ success: true });
      }
      case 'check': {
        const result = await integration.checkStatus(data);
        return NextResponse.json(result);
      }
      case 'metrics': {
        const metrics = await integration.getMetrics();
        return NextResponse.json(metrics);
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('HttpEndpoint Integration Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
