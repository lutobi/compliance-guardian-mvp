import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Evidence } from '@/types/evidence';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { resolveFrameworkUuid } from '@/lib/resolveFrameworkUuid';

export async function GET(request: Request) {
  console.log('Evidence API GET called');
  const { searchParams } = new URL(request.url);
  const frameworkId = searchParams.get('frameworkId');
  const subcontrolId = searchParams.get('subcontrolId');
  const assessmentId = searchParams.get('assessmentId');

  console.log('Evidence API params:', { frameworkId, subcontrolId, assessmentId });

  if (!frameworkId && !subcontrolId && !assessmentId) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });

  // Resolve frameworkId (slug or UUID)
  let frameworkUuid: string | null = null;
  if (frameworkId) {
    try {
      frameworkUuid = await resolveFrameworkUuid(supabase, frameworkId);
    } catch {
      return NextResponse.json({ data: [] });
    }
  }

  try {
    let data, error;
    if (assessmentId) {
      // Fetch evidence by assessment_id directly
      const result = await supabase
        .from('evidence')
        .select('*')
        .eq('assessment_id', assessmentId)
        .order('created_at', { ascending: false });
      data = result.data;
      error = result.error;
    } else {
      // Build query based on framework or subcontrol
      let query = supabase
        .from('evidence')
        .select('*')
        .order('created_at', { ascending: false });
      if (frameworkId) {
        query = query.eq('framework_id', frameworkUuid);
      }
      if (subcontrolId) {
        query = query.eq('subcontrol_id', subcontrolId);
      }
      const result = await query;
      data = result.data;
      error = result.error;
    }
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
  } catch (error: any) {
    console.error('Error fetching evidence:', error);
    if (error.message.includes('invalid input syntax for type uuid')) {
      return NextResponse.json({ data: [] });
    }
    return NextResponse.json({ error: error.message || 'Failed to fetch evidence' }, { status: 500 });
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
    
    // Resolve frameworkId (slug or UUID)
    let frameworkUuid: string;
    try {
      frameworkUuid = await resolveFrameworkUuid(supabase, body.frameworkId);
    } catch {
      return NextResponse.json({ error: 'Invalid frameworkId' }, { status: 400 });
    }

    // No strict requirement for subcontrolId/frameworkId here; proceed with available data
    if (!body.frameworkId) console.warn('POST /api/evidence missing frameworkId');
    if (!body.subcontrolId) console.warn('POST /api/evidence missing subcontrolId');

    // Determine title
    let controlName = body.controlName || 'control';
    let title = `Evidence for ${controlName}`;
    
    // Build base record
    const record: any = {
      subcontrol_id: body.subcontrolId,
      framework_id: frameworkUuid,
      user_id: user.id,
      title,
      notes: body.notes || '',
      tags: body.tags || [],
      files: body.files || []
    };
    
    // Link evidence to assessment directly
    if (body.assessmentId) {
      record.assessment_id = body.assessmentId;
    }
    
    console.log('Inserting evidence record:', record);
    const { data, error } = await supabase
      .from('evidence')
      .insert(record)
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

// Handle evidence update
export async function PUT(request: Request) {
  console.log('Evidence API PUT called');
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const id = body.id;
    if (!id) {
      return NextResponse.json({ error: 'Missing evidence ID' }, { status: 400 });
    }
    const record: any = {};
    if (body.notes !== undefined) record.notes = body.notes;
    if (body.tags !== undefined) record.tags = body.tags;
    if (body.files !== undefined) record.files = body.files;
    record.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('evidence')
      .update(record)
      .eq('id', id)
      .select('*')
      .single();
    if (error) {
      console.error('Error updating evidence:', error);
      return NextResponse.json({ error: error.message || 'Failed to update evidence' }, { status: 500 });
    }
    const mappedData: Evidence = {
      id: data.id,
      subcontrolId: data.subcontrol_id,
      frameworkId: data.framework_id,
      files: data.files || [],
      notes: data.notes || '',
      tags: data.tags || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      controlName: data.title?.replace('Evidence for ', '') || ''
    };
    return NextResponse.json({ data: mappedData, success: true });
  } catch (error: any) {
    console.error('Error in evidence PUT:', error);
    return NextResponse.json({ error: error.message || 'Failed to update evidence' }, { status: 500 });
  }
}

// Handle evidence deletion
export async function DELETE(request: Request) {
  console.log('Evidence API DELETE called');
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const body = await request.json();
    const id = body.id;
    if (!id) {
      return NextResponse.json({ error: 'Missing evidence ID' }, { status: 400 });
    }
    const { error } = await supabase
      .from('evidence')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Error deleting evidence:', error);
      return NextResponse.json({ error: error.message || 'Failed to delete evidence' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in evidence DELETE:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete evidence' }, { status: 500 });
  }
}
