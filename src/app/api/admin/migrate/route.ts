import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    
    // Simple authentication check
    if (code !== 'migrate-functions-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Read and execute the workspace functions SQL
    const fs = require('fs');
    const path = require('path');
    const sqlPath = path.join(process.cwd(), 'migrations', 'WORKSPACE_FUNCTIONS.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Migration error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Functions migrated successfully' });
  } catch (error) {
    console.error('Migration endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}