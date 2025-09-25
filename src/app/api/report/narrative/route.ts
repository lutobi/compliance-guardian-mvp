/**
 * REPORT NARRATIVE API - MULTI-TENANT (STANDARDIZED)
 * 
 * Generates AI-powered narrative summaries for assessment reports with workspace context:
 * - GET: Generate narrative summary using OpenAI for assessment compliance data
 */

import { NextRequest } from 'next/server';
import { 
  withWorkspaceContext,
  getWorkspaceScopedClient,
  getWorkspaceMetadata
} from '@/lib/api/request-utils';
import { z } from 'zod';

const requestSchema = z.object({ 
  assessmentId: z.string().uuid() 
});

export async function GET(request: NextRequest) {
  return withWorkspaceContext(request, 'view_reports', async (context) => {
    // Get query parameters
    const { user, workspaceContext } = context;
    const url = new URL(request.url);
    const assessmentId = url.searchParams.get('assessmentId');

    if (!assessmentId || !requestSchema.safeParse({ assessmentId }).success) {
      throw new Error('Valid assessment ID is required');
    }
    
    // Get workspace-scoped database client
    const supabase = getWorkspaceScopedClient(workspaceContext.slug);
    
    console.log(`[API] GET /api/report/narrative - User: ${user.profile.email}, Assessment: ${assessmentId}`);

    // Verify assessment belongs to workspace
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('id, title, workspace_id')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      throw new Error('Assessment not found');
    }

    // Get summary data directly from database instead of API call
    const [
      { count: total }, 
      { count: compliant }, 
      { count: nonCompliant }
    ] = await Promise.all([
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

    const totalCount = total ?? 0;
    const compliantCount = compliant ?? 0;
    const nonCompliantCount = nonCompliant ?? 0;
    const pendingCount = totalCount - compliantCount - nonCompliantCount;
    const score = totalCount > 0 ? Number(((compliantCount / totalCount) * 100).toFixed(2)) : 0;

    // Check for OpenAI API key
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured, returning basic narrative');
      const basicNarrative = `Assessment shows ${score}% compliance with ${compliantCount} controls implemented, ${nonCompliantCount} non-compliant, and ${pendingCount} pending review.`;
      return { 
        narrative: basicNarrative,
        generated_by: 'system',
        assessment: {
          id: assessment.id,
          title: assessment.title
        },
        workspace: getWorkspaceMetadata(user)
      };
    }

    const prompt = `You are an expert compliance reporting assistant. Generate a concise (2–3 sentence) narrative summarizing these results:\n- Compliance score: ${score}%\n- Compliant: ${compliantCount}/${totalCount}\n- Non-compliant: ${nonCompliantCount}/${totalCount}\n- Pending: ${pendingCount}/${totalCount}`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You generate succinct compliance narratives.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 150,
          temperature: 0.7
        }),
      });

      if (!response.ok) {
        console.error('OpenAI API error:', await response.text());
        const fallbackNarrative = `Assessment shows ${score}% compliance with ${compliantCount} controls implemented, ${nonCompliantCount} non-compliant, and ${pendingCount} pending review.`;
        return { 
          narrative: fallbackNarrative,
          generated_by: 'fallback',
          workspace: getWorkspaceMetadata(user)
        };
      }

      const data = await response.json();
      const narrative = data.choices?.[0]?.message?.content?.trim() || '';
      
      return { 
        narrative,
        generated_by: 'openai',
        assessment: {
          id: assessment.id,
          title: assessment.title
        },
        workspace: getWorkspaceMetadata(user)
      };

    } catch (openaiError) {
      console.error('OpenAI error:', openaiError);
      const fallbackNarrative = `Assessment shows ${score}% compliance with ${compliantCount} controls implemented, ${nonCompliantCount} non-compliant, and ${pendingCount} pending review.`;
      return { 
        narrative: fallbackNarrative,
        generated_by: 'fallback',
        workspace: getWorkspaceMetadata(user)
      };
    }

  });
}
