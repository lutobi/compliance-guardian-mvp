/**
 * HEALTH CHECK API
 * 
 * Provides system health status - no authentication required
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const timestamp = new Date().toISOString();
  
  return NextResponse.json({ 
    status: 'ok',
    timestamp,
    version: '1.0.0',
    architecture: 'multi-tenant'
  });
}
