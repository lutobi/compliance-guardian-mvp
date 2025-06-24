// src/app/api/report/summary/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Ensure service role key is provided
if (!SERVICE_ROLE_KEY) {
  console.error('Missing Supabase Service Role Key');
}

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL ?? '', SERVICE_ROLE_KEY ?? '');

const requestSchema = z.object({ assessmentId: z.string().uuid() });

export async function GET(request: Request) {
  // Ensure Supabase URL and service role key are set
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Missing Supabase URL or Service Role Key');
    return NextResponse.json({ score: 0, compliant: 0, nonCompliant: 0, pending: 0, total: 0 });
  }

  const { searchParams } = new URL(request.url);
  const assessmentId = searchParams.get('assessmentId');
  if (!assessmentId) {
    return NextResponse.json({ error: 'assessmentId is required' }, { status: 400 });
  }

  const parse = requestSchema.safeParse({ assessmentId });
  if (!parse.success) {
    return NextResponse.json(
      { error: 'Invalid assessmentId', details: parse.error.flatten() },
      { status: 400 }
    );
  }

  try {
    // Query assessment_controls table for summary counts
    const [{ count: total }, { count: compliant }, { count: nonCompliant }] = await Promise.all([
      supabase
        .from('assessment_controls')
        .select('*', { head: true, count: 'exact' })
        .eq('assessment_id', assessmentId),
      supabase
        .from('assessment_controls')
        .select('*', { head: true, count: 'exact' })
        .eq('assessment_id', assessmentId)
        .eq('status', 'implemented'),
      supabase
        .from('assessment_controls')
        .select('*', { head: true, count: 'exact' })
        .eq('assessment_id', assessmentId)
        .eq('status', 'not_compliant'),
    ]);
    const t = total ?? 0;
    const c = compliant ?? 0;
    const n = nonCompliant ?? 0;
    const p = t - c - n;
    const score = t > 0 ? Number(((c / t) * 100).toFixed(2)) : 0;
    return NextResponse.json({ score, compliant: c, nonCompliant: n, pending: p, total: t });
  } catch (err: any) {
    console.error('Error in summary:', err);
    return NextResponse.json({ score: 0, compliant: 0, nonCompliant: 0, pending: 0, total: 0 });
  }
}
