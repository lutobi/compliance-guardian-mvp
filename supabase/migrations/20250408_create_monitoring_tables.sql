-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create monitoring tables

-- Create monitoring_points table
CREATE TABLE IF NOT EXISTS public.monitoring_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('pending', 'compliant', 'non_compliant', 'review_required')) NOT NULL DEFAULT 'pending',
    last_review_date TIMESTAMP WITH TIME ZONE,
    next_review_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reviewers TEXT[],
    evidence_required BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create monitoring table
CREATE TABLE IF NOT EXISTS public.monitoring (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    framework_id UUID REFERENCES frameworks(id),
    settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create monitoring_controls table
CREATE TABLE IF NOT EXISTS public.monitoring_controls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    monitoring_id UUID REFERENCES monitoring(id),
    control_id UUID REFERENCES controls(id),
    status TEXT CHECK (status IN ('pending', 'compliant', 'non_compliant', 'review_required')) NOT NULL DEFAULT 'pending',
    last_checked TIMESTAMP WITH TIME ZONE,
    next_check TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create evidence table
CREATE TABLE IF NOT EXISTS public.evidence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    monitoring_point_id UUID REFERENCES monitoring_points(id),
    type TEXT CHECK (type IN ('document', 'test_result', 'audit_report', 'screen_capture', 'log_file')) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    uploaded_by TEXT NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create monitoring_metrics table
CREATE TABLE IF NOT EXISTS public.monitoring_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    monitoring_point_id UUID REFERENCES monitoring_points(id),
    name TEXT NOT NULL,
    value NUMERIC NOT NULL,
    threshold NUMERIC,
    unit TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.monitoring_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own monitoring points" ON public.monitoring_points
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create monitoring points" ON public.monitoring_points
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own monitoring points" ON public.monitoring_points
    FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view monitoring data" ON public.monitoring
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create monitoring data" ON public.monitoring
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view monitoring controls" ON public.monitoring_controls
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create monitoring controls" ON public.monitoring_controls
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view evidence" ON public.evidence
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create evidence" ON public.evidence
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view monitoring metrics" ON public.monitoring_metrics
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create monitoring metrics" ON public.monitoring_metrics
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
