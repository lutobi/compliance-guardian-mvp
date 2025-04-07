import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log('Evidence API GET called');
  const { searchParams } = new URL(request.url);
  const frameworkId = searchParams.get('frameworkId');
  const subcontrolId = searchParams.get('subcontrolId');

  console.log('Evidence API params:', { frameworkId, subcontrolId });

  // Validate UUID format
  if (frameworkId && !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(frameworkId)) {
    return NextResponse.json({ error: 'Invalid framework ID format' }, { status: 400 });
  }

  if (!frameworkId && !subcontrolId) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });

  try {
    const query = supabase
      .from('evidence')
      .select('*')
      .order('created_at', { ascending: false });

    if (frameworkId) {
      query.eq('framework_id', frameworkId);
    }

    if (subcontrolId) {
      query.eq('subcontrol_id', subcontrolId);
    }

    const { data, error } = await query;
    console.log('Evidence query result:', { data, error });

    if (error) throw error;

    const formattedData = data?.map(item => ({
      id: item.id,
      subcontrolId: item.subcontrol_id,
      frameworkId: item.framework_id,
      files: item.files || [],
      notes: item.notes || '',
      tags: item.tags || [],
      createdAt: item.created_at,
      updatedAt: item.updated_at
    })) || [];

    return NextResponse.json({ data: formattedData });
  } catch (error) {
    console.error('Error fetching evidence:', error);
    return NextResponse.json({ error: 'Failed to fetch evidence' }, { status: 500 });
  }
}
