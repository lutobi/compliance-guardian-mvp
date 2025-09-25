/**
 * PDF REPORT API - MULTI-TENANT (STANDARDIZED)
 * 
 * Generates compliance assessment PDF reports with workspace context:
 * - GET: Generate PDF report for assessment with charts, narrative, and evidence
 */

import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import QuickChart from 'quickchart-js';
import OpenAI from 'openai';
import { createWorker } from 'tesseract.js';
import fs from 'fs';
import path from 'path';
import { 
  withWorkspaceContext,
  getWorkspaceScopedClient
} from '@/lib/api/request-utils';

// Monkey-patch fs.readFileSync to redirect Helvetica.afm reads to the original PDFKit data file
const origReadFileSync = fs.readFileSync;
// Using type assertion to help TypeScript understand the override
(fs as any).readFileSync = (file: fs.PathOrFileDescriptor, options?: any) => {
  const filePath = typeof file === 'string' ? file : file.toString();
  if (filePath.endsWith('Helvetica.afm')) {
    const altPath = path.join(process.cwd(), 'node_modules', 'pdfkit', 'js', 'data', 'Helvetica.afm');
    return origReadFileSync.call(fs, altPath, options);
  }
  return origReadFileSync.call(fs, file, options);
};

export async function GET(request: NextRequest) {
  return withWorkspaceContext(request, 'view_reports', async (context) => {
    // Get query parameters
    const { user, workspaceContext } = context;
    const url = new URL(request.url);
    const assessmentId = url.searchParams.get('assessmentId');

    if (!assessmentId) {
      throw new Error('Assessment ID is required');
    }
    
    // Get workspace-scoped database client
    const supabase = getWorkspaceScopedClient(workspaceContext.slug);
    
    console.log(`[API] GET /api/report/pdf - User: ${user.profile.email}, Assessment: ${assessmentId}`);

    // Verify assessment belongs to workspace
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('id, title, workspace_id')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      throw new Error('Assessment not found');
    }

    const origin = request.headers.get('origin') || url.origin;
  // require pdf-parse at runtime
  // @ts-ignore
  const pdf = eval("require")("pdf-parse");
  // require pdfkit-table plugin at runtime
  // @ts-ignore
  eval("require")("pdfkit-table");
  // Fetch summary
  const summaryRes = await fetch(`${origin}/api/report/summary?assessmentId=${assessmentId}`);
  if (!summaryRes.ok) {
    const msg = await summaryRes.text();
    console.error(`Summary API error: HTTP ${summaryRes.status} - ${msg}`);
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 });
  }
  const summary = await summaryRes.json();
  // Fetch narrative
  const narrativeRes = await fetch(`${origin}/api/report/narrative?assessmentId=${assessmentId}`);
  if (!narrativeRes.ok) {
    const msg = await narrativeRes.text();
    console.error(`Narrative API error: HTTP ${narrativeRes.status} - ${msg}`);
    return NextResponse.json({ error: 'Failed to fetch narrative' }, { status: 500 });
  }
  const narrativeJson = await narrativeRes.json();
  const narrative = narrativeJson.narrative || '';

  // Optional improvement suggestions via OpenAI
  let suggestions = '';

    // Fetch and parse evidence within workspace context
    const { data: evidences } = await supabase
      .from('evidence')
      .select('files,notes')
      .eq('assessment_id', assessmentId);
    let evidenceText = '';
    if (evidences) {
      // Extract text from evidence notes and file metadata
      for (const evidence of evidences) {
        try {
          // Add notes content
          if (evidence.notes) {
            evidenceText += evidence.notes + '\n';
          }
          
          // Add file information (simplified approach)
          if (evidence.files && Array.isArray(evidence.files)) {
            evidenceText += `Files: ${evidence.files.length} attached\n`;
            // Note: File content parsing would require actual file access
            // which may not be available in this context
          }
        } catch (e) {
          console.error('Evidence parse error:', e);
        }
      }
    }
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const prompt = `Based on the compliance results (score: ${summary.score}%, compliant: ${summary.compliant}, non-compliant: ${summary.nonCompliant}, pending: ${summary.pending}) and the extracted evidence text (first 2000 chars): ${evidenceText.slice(0,2000)}, provide 3 bullet-point suggestions to improve evidence completeness and highlight strengths and weaknesses.`;
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert compliance assistant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7
      });
      suggestions = completion.choices[0].message?.content || '';
    } catch (e) {
      console.error('Error generating suggestions:', e);
    }
  }

    // Create PDF document using default Helvetica font
  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  const pdfBufferPromise = new Promise<Buffer>(resolve => doc.on('end', () => resolve(Buffer.concat(chunks))));

  // Header
  const now = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  // Title
  doc.fontSize(18).text('Compliance Assessment Report', doc.page.margins.left, 50);
  // Timestamp right-aligned
  const timestamp = `Generated: ${now}`;
  doc.fontSize(10).text(timestamp, doc.page.width - doc.page.margins.right - doc.widthOfString(timestamp), 50);
  
  const headerBottom = 80;
  doc.y = headerBottom;

  // Summary Stats Cards
  const stats = [
    { label: 'Total Controls', value: summary.total },
    { label: 'Compliant', value: summary.compliant },
    { label: 'Non-Compliant', value: summary.nonCompliant },
    { label: 'Pending', value: summary.pending },
  ];
  const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const cardWidth = (usableWidth - (stats.length - 1) * 10) / stats.length;
  const cardHeight = 50;
  let cardX = doc.page.margins.left;
  const cardY = doc.y;
  stats.forEach(({ label, value }) => {
    doc.rect(cardX, cardY, cardWidth, cardHeight).stroke();
    doc.fontSize(10).text(label, cardX + 5, cardY + 5, { width: cardWidth - 10 });
    doc.fontSize(14).text(value.toString(), cardX + 5, cardY + 20, { width: cardWidth - 10 });
    cardX += cardWidth + 10;
  });
  const afterCardsY = cardY + cardHeight + 20;
  doc.y = afterCardsY;

  // Charts: Gauge and Status Bar
  try {
    // Gauge
    const gaugeQc = new QuickChart();
    gaugeQc.setConfig({
      type: 'doughnut',
      data: { datasets: [ { data: [summary.score, 100 - summary.score], backgroundColor: ['#4CAF50', '#DDDDDD'], borderWidth: 0 } ] },
      options: { rotation: -Math.PI, circumference: Math.PI, cutoutPercentage: 70 }
    }).setWidth(250).setHeight(125).setBackgroundColor('white');
    const gaugeBuf = Buffer.from(await (await fetch(gaugeQc.getUrl())).arrayBuffer());
    // Bar chart
    const barQc = new QuickChart();
    barQc.setConfig({
      type: 'bar',
      data: { labels: ['Compliant', 'Pending', 'Non-Compliant'], datasets: [ { data: [summary.compliant, summary.pending, summary.nonCompliant], backgroundColor: ['#4CAF50', '#FF9800', '#F44336'] } ] },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    }).setWidth(250).setHeight(125).setBackgroundColor('white');
    const barBuf = Buffer.from(await (await fetch(barQc.getUrl())).arrayBuffer());
    const chartY = doc.y;
    doc.image(gaugeBuf, doc.page.margins.left, chartY);
    doc.image(barBuf, doc.page.margins.left + 260, chartY);
    doc.moveDown(8);
    } catch (e) {
    console.error('Chart generation error:', e);
  }


  // Score & narrative
  doc.fontSize(14).text(`Compliance Score: ${summary.score}%`);
  doc.moveDown();
  doc.fontSize(12).text(narrative);
  doc.moveDown();

  if (suggestions) {
      // Render controls status table within workspace context
      const { data: controls } = await supabase
        .from('assessment_controls')
        .select('control_name,status')
        .eq('assessment_id', assessmentId);
        
      interface Control {
        control_name: string;
        status: string;
      }
      if (controls) {
        const table = {
          headers: ['Control', 'Status'],
          rows: controls ? controls.map((c: Control) => [c.control_name, c.status]) : [],
        };
        // add some spacing
        doc.moveDown(1);
        await doc.table(table, { width: doc.page.width - doc.page.margins.left - doc.page.margins.right });
      }
      // Improvement suggestions header continues

    doc.fontSize(14).text('Improvement Suggestions:');
    doc.fontSize(12).list(
      // Split suggestions by lines or bullet points
      suggestions.split(/\r?\n/).filter(line => line.trim()),
      { bullet: '•' }
    );
  }

  doc.end();
  const pdfBuffer = await pdfBufferPromise;

    return new NextResponse(pdfBuffer, {
    status: 200,
    headers: { 'Content-Type': 'application/pdf' }
  });
  }).catch(error => {
    console.error('Error generating PDF report:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate PDF report' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  });
}
export const runtime = 'nodejs';
