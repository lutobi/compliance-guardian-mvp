import { insertSampleData } from '@/app/dashboard/frameworks/sample-data';
import { NextResponse } from 'next/server';

export const dynamic = 'force-static'

export async function GET() {
  await insertSampleData();
  return NextResponse.json({ success: true });
}
