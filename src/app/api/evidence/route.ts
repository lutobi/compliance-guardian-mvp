import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Evidence } from '@/types/evidence';

export async function GET(request: Request) {
  console.log('Evidence API GET called');
  const { searchParams } = new URL(request.url);
  const frameworkId = searchParams.get('frameworkId');
  const subcontrolId = searchParams.get('subcontrolId');

  console.log('Evidence API params:', { frameworkId, subcontrolId });

  if (!frameworkId && !subcontrolId) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Build query based on parameters
    let query = supabase
      .from('evidence')
      .select('*')
      .order('created_at', { ascending: false });

    if (frameworkId) {
      query = query.eq('framework_id', frameworkId);
    }

    if (subcontrolId) {
      query = query.eq('subcontrol_id', subcontrolId);
    }

    const { data, error } = await query;
    console.log('Evidence query result:', { data, error });

    if (error) throw error;

    // Map database results to Evidence type
    const formattedData = data?.map(item => ({
      id: item.id,
      subcontrolId: item.subcontrol_id,
      frameworkId: item.framework_id,
      files: item.files || [],
      notes: item.notes || '',
      tags: item.tags || [],
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      controlName: item.title?.replace('Evidence for ', '') || ''
    })) || [];

    return NextResponse.json({ data: formattedData });
  } catch (error) {
    console.error('Error fetching evidence:', error);
    return NextResponse.json({ error: 'Failed to fetch evidence' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  console.log('Evidence API POST called');
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    console.log('Evidence POST body:', body);
    
    if (!body.subcontrolId || !body.frameworkId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get the control name if available
    let controlName = body.controlName || 'control';
    let title = `Evidence for ${controlName}`;
    
    // Create evidence record with all required fields
    const evidenceRecord = {
      subcontrol_id: body.subcontrolId,
      framework_id: body.frameworkId,
      user_id: user.id,
      title: title,
      notes: body.notes || '',
      tags: body.tags || [],
      files: body.files || []
    };
    
    console.log('Inserting evidence record:', evidenceRecord);
    const { data, error } = await supabase
      .from('evidence')
      .insert(evidenceRecord)
      .select('*')
      .single();
      
    if (error) {
      console.error('Error adding evidence:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log('Evidence added successfully:', data);
    
    // Map the response to the Evidence type
    const mappedData: Evidence = {
      id: data.id,
      subcontrolId: data.subcontrol_id,
      frameworkId: data.framework_id,
      files: data.files || [],
      notes: data.notes || '',
      tags: data.tags || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      controlName: body.controlName
    };
    
    return NextResponse.json({ data: mappedData, success: true });
  } catch (error: any) {
    console.error('Error in evidence POST:', error);
    return NextResponse.json({ error: error.message || 'Failed to add evidence' }, { status: 500 });
  }
}
