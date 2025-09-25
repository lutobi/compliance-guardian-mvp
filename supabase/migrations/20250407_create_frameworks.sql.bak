-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create frameworks table
CREATE TABLE IF NOT EXISTS public.frameworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  version TEXT,
  categories TEXT[],
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE public.frameworks ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow anonymous read access"
  ON public.frameworks
  FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users to insert/update
CREATE POLICY "Allow authenticated insert"
  ON public.frameworks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update"
  ON public.frameworks
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
