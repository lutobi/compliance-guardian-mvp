import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
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
      // Fetch only evidence belonging to this assessment
      const { data: acRows, error: acError } = await supabase
        .from('assessment_controls')
        .select('id')
        .eq('assessment_id', assessmentId);
      if (acError) throw acError;
      const acIds = acRows.map(r => r.id);
      if (acIds.length === 0) {
        return NextResponse.json({ data: [] });
      }
      const result = await supabase
        .from('evidence')
        .select('*')
        .in('assessment_control_id', acIds)
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
    
    // If assessmentId and controlId provided, fetch or create assessment control mapping
    if (body.assessmentId && body.controlId) {
      // First try to find existing assessment control
      const { data: acRows, error: acError } = await supabase
        .from('assessment_controls')
        .select('id')
        .eq('assessment_id', body.assessmentId)
        .eq('control_ref', body.controlId);
      if (acError) throw acError;

      if (acRows && acRows.length > 0) {
        // Use existing assessment control
        record.assessment_control_id = acRows[0].id;
      } else {
        // Create new assessment control
        const { data: newAc, error: newAcError } = await supabase
          .from('assessment_controls')
          .insert({
            assessment_id: body.assessmentId,
            control_ref: body.controlId,
            status: 'in_progress'
          })
          .select('id')
          .single();
        if (newAcError) throw newAcError;
        record.assessment_control_id = newAc.id;
      }
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
