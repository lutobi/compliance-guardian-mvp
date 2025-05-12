import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Evidence } from '@/types/evidence';

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
        query = query.eq('framework_id', frameworkId);
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
    
    if (!body.subcontrolId || !body.frameworkId || !body.assessmentId || !body.controlId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get the control name if available
    let controlName = body.controlName || 'control';
    let title = `Evidence for ${controlName}`;
    
    // Find assessment_control mapping
    const { data: acRows, error: acError } = await supabase
      .from('assessment_controls')
      .select('id')
      .eq('assessment_id', body.assessmentId)
      .eq('control_id', body.controlId);
    if (acError) throw acError;
    if (!acRows || acRows.length === 0) {
      return NextResponse.json({ error: 'Assessment control mapping not found' }, { status: 400 });
    }
    const assessmentControlId = acRows[0].id;
    
    // Create evidence record with all required fields
    const evidenceRecord = {
      assessment_control_id: assessmentControlId,
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
