const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function testUserProfileSchema() {
  console.log('Testing user_profiles table schema...');
  
  try {
    // Test 1: Check if table exists and get structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('Table query error:', tableError);
      
      // Try to create the table with correct schema
      console.log('Attempting to create user_profiles table...');
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.user_profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT NOT NULL,
            name TEXT,
            avatar_url TEXT,
            default_workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
            user_type TEXT DEFAULT 'customer',
            role_name TEXT DEFAULT 'member',
            timezone TEXT DEFAULT 'UTC',
            locale TEXT DEFAULT 'en-US',
            theme TEXT DEFAULT 'light',
            settings JSONB DEFAULT '{}',
            onboarding_completed BOOLEAN DEFAULT FALSE,
            last_active_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
          
          -- Enable RLS
          ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
          
          -- Create policies
          DROP POLICY IF EXISTS "Users can read their own profile" ON public.user_profiles;
          CREATE POLICY "Users can read their own profile"
            ON public.user_profiles FOR SELECT
            USING (auth.uid() = id);
            
          DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
          CREATE POLICY "Users can update their own profile"
            ON public.user_profiles FOR UPDATE
            USING (auth.uid() = id)
            WITH CHECK (auth.uid() = id);
            
          DROP POLICY IF EXISTS "Users can create their own profile" ON public.user_profiles;
          CREATE POLICY "Users can create their own profile"
            ON public.user_profiles FOR INSERT
            WITH CHECK (auth.uid() = id);
        `
      });
      
      if (createError) {
        console.error('Failed to create table:', createError);
      } else {
        console.log('Table created successfully');
      }
    } else {
      console.log('Table exists, sample data:', tableInfo);
    }
    
    // Test 2: Try to insert a test profile
    const testUserId = '00000000-0000-0000-0000-000000000000';
    console.log('Testing profile creation...');
    
    const { data: insertData, error: insertError } = await supabase
      .from('user_profiles')
      .upsert({
        id: testUserId,
        email: 'test@example.com',
        name: 'Test User',
        user_type: 'customer',
        role_name: 'member'
      })
      .select();
    
    if (insertError) {
      console.log('Insert error:', insertError);
    } else {
      console.log('Insert successful:', insertData);
      
      // Clean up test data
      await supabase
        .from('user_profiles')
        .delete()
        .eq('id', testUserId);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testUserProfileSchema();
