/**
 * HTML-PDF REPORT API - MULTI-TENANT (STANDARDIZED)
 * 
 * Generates HTML-based PDF reports for assessment compliance data with workspace context:
 * - GET: Generate PDF report from HTML with charts, narrative, and evidence
 */

import { NextRequest, NextResponse } from 'next/server';
import QuickChart from 'quickchart-js';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { 
  withWorkspaceContext,
  getWorkspaceScopedClient
} from '@/lib/api/request-utils';

// AI Provider configuration
const AI_PROVIDER = process.env.AI_PROVIDER ?? 'openai';
let OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  try {
    OPENAI_API_KEY = fs.readFileSync(path.join(process.cwd(), 'credentials/openai.key'), 'utf-8').trim();
    console.log('DEBUG-HTML-PDF-ROUTE: Loaded OPENAI_API_KEY from credentials/openai.key');
  } catch (e) {
    console.warn('DEBUG-HTML-PDF-ROUTE: OpenAI key not found in env or credentials file.');
  }
}
let DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
if (!DEEPSEEK_API_KEY) {
  try {
    DEEPSEEK_API_KEY = fs.readFileSync(path.join(process.cwd(), 'credentials/deepseek.key'), 'utf-8').trim();
    console.log('DEBUG-HTML-PDF-ROUTE: Loaded DEEPSEEK_API_KEY from credentials/deepseek.key');
  } catch (e) {
    console.warn('DEBUG-HTML-PDF-ROUTE: Deepseek key not found in env or credentials file.');
  }
}

// Unified chat completion with OpenAI primary and Deepseek fallback
async function chatAI(
  model: string,
  messages: { role: string; content: string }[],
  max_tokens: number,
  temperature: number
): Promise<string> {
  console.log('DEBUG-chatAI: OPENAI_API_KEY present =', !!OPENAI_API_KEY, 'DEEPSEEK_API_KEY present =', !!DEEPSEEK_API_KEY);
  // Try OpenAI first
  if (OPENAI_API_KEY) {
    console.log('DEBUG-chatAI: using OpenAI, messages=', messages);
    try {
      const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
      // @ts-ignore
      const resp = await openai.chat.completions.create({ model, messages: messages as any, max_tokens, temperature });
      return resp.choices?.[0]?.message?.content || '';
    } catch (err) {
      console.error('DEBUG-chatAI: OpenAI error, falling back to Deepseek', err);
    }
  }
  // Fallback to Deepseek
  if (DEEPSEEK_API_KEY) {
    console.log('DEBUG-chatAI: using Deepseek, messages=', messages);
    try {
      const res = await fetch('https://api.deepseek.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, messages, max_tokens, temperature }),
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (err) {
      console.error('DEBUG-chatAI: Deepseek error', err);
    }
  }
  console.warn('DEBUG-chatAI: No AI key available');
  return '';
}

// HTML-to-PDF endpoint using Puppeteer with workspace context security
export async function GET(request: NextRequest) {
  return withWorkspaceContext(request, 'view_reports', async (context) => {
    // Get query parameters and workspace context
    const { user, workspaceContext } = context;
    console.log(`[API] GET /api/report/html-pdf - User: ${user.profile.email}`);    
    console.log('DEBUG-HTML-PDF-ROUTE: AI_PROVIDER =', AI_PROVIDER, 'OPENAI_API_KEY present =', !!OPENAI_API_KEY, 'DEEPSEEK_API_KEY present =', !!DEEPSEEK_API_KEY);
    // ... (rest of the code remains the same)

    const url = new URL(request.url);
    const assessmentId = url.searchParams.get('assessmentId');
    console.log('DEBUG-HTML-PDF-ROUTE: assessmentId', assessmentId);
    if (!assessmentId) {
      throw new Error('Assessment ID is required');
    }
    
    // Get workspace-scoped database client
    const supabase = getWorkspaceScopedClient(workspaceContext.slug);
    
    // Verify assessment belongs to workspace
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('id, workspace_id')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      throw new Error('Assessment not found');
    }
    const origin = request.headers.get('origin') || url.origin;
    // require pdf-parse at runtime
    // @ts-ignore
    const pdf = eval("require")("pdf-parse");

    // Fetch data
    const [summaryRes, narrativeRes] = await Promise.all([
      fetch(`${origin}/api/report/summary?assessmentId=${assessmentId}`),
      fetch(`${origin}/api/report/narrative?assessmentId=${assessmentId}`),
    ]);
        console.log('DEBUG-HTML-PDF-ROUTE: summaryRes.ok', summaryRes.ok, 'status', summaryRes.status);
    console.log('DEBUG-HTML-PDF-ROUTE: narrativeRes.ok', narrativeRes.ok, 'status', narrativeRes.status);
    if (!summaryRes.ok || !narrativeRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch report data' }, { status: 500 });
    }
    const summary = await summaryRes.json();
    console.log('DEBUG-HTML-PDF-ROUTE: summary', summary);
    const narrativeJson = await narrativeRes.json();
    let narrative = narrativeJson.narrative || '';
    if (!narrative) {
      narrative = `Your assessment shows a compliance score of ${summary.score}%. Out of ${summary.total} controls, ${summary.compliant} compliant, ${summary.pending} pending, and ${summary.nonCompliant} non-compliant.`;
      console.log('DEBUG-HTML-PDF-ROUTE: fallback narrative', narrative);
    }
    console.log('DEBUG-HTML-PDF-ROUTE: narrative', narrative);

    // AI Suggestions
    let suggestions: string[] = [];
    try {
      const prompt = `Based on the compliance results (score: ${summary.score}%, compliant: ${summary.compliant}, non-compliant: ${summary.nonCompliant}, pending: ${summary.pending}), provide 3 bullet-point suggestions to improve evidence completeness and highlight strengths and weaknesses.`;
      const text = await chatAI('gpt-3.5-turbo', [
        { role: 'system', content: 'You are an expert compliance assistant.' },
        { role: 'user', content: prompt }
      ], 200, 0.7);
      suggestions = text.split(/\r?\n/).filter(l => l.trim());
    } catch (e) {
      console.error('AI suggestions error:', e);
    console.log('DEBUG-HTML-PDF-ROUTE: suggestions', suggestions);
    if (suggestions.length === 0) {
      suggestions = [
        `Improve documentation for pending controls (${summary.pending}) to ensure compliance readiness.`,
        `Leverage your strengths: ${summary.compliant} controls are compliant; maintain this evidence.`,
        `Review non-compliant controls (${summary.nonCompliant}) for remediation to reduce risks.`
      ];
      console.log('DEBUG-HTML-PDF-ROUTE: fallback suggestions', suggestions);
    }
    }

    // Fallback suggestions for empty AI recommendations
    if (suggestions.length === 0) {
      suggestions = [
        `Improve documentation for pending controls (${summary.pending}) to ensure compliance readiness.`,
        `Leverage your strengths: ${summary.compliant} controls are compliant; maintain this evidence.`,
        `Review non-compliant controls (${summary.nonCompliant}) for remediation to reduce risks.`
      ];
      console.log('DEBUG-HTML-PDF-ROUTE: fallback suggestions', suggestions);
    }

    // Fetch evidences and controls
    const { data: evidences } = await supabase.from('evidences').select('file_url,type').eq('assessment_id', assessmentId);
    const evidenceCount = evidences?.length ?? 0;
    const { data: controls } = await supabase.from('assessment_controls').select('control_name,status').eq('assessment_id', assessmentId).limit(10);
    const controlsList = controls ?? [];
    console.log('DEBUG-HTML-PDF-ROUTE: controlsList length', controlsList.length);
    const evidencesList = evidences ?? [];
    console.log('DEBUG-HTML-PDF-ROUTE: evidencesList length', evidencesList.length);
    // Initialize evidenceDetails array for processing
    let evidenceDetails: { name: string; type: string; snippet: string; }[] = [];
if (evidencesList.length === 0) {
  console.log('DEBUG-HTML-PDF-ROUTE: no evidences to process, skipping Tesseract extraction');
} else {
// Extract text from evidence files

    try {
// @ts-ignore
console.log('DEBUG-TESSERACT: default worker path:', path.join(process.cwd(), '.next/worker-script/node/index.js'), fs.existsSync(path.join(process.cwd(), '.next/worker-script/node/index.js')));
        let tjsNodePath: string;
        try { tjsNodePath = require.resolve('tesseract.js-node'); } catch (e) { tjsNodePath = 'not found'; }
        console.log('DEBUG-TESSERACT: tesseract.js-node resolution:', tjsNodePath);
        console.log('DEBUG-TESSERACT: tesseract.js resolution:', require.resolve('tesseract.js'));
        // @ts-ignore
        const worker: any = await createWorker({
  workerPath: path.join(process.cwd(), 'node_modules', 'tesseract.js', 'dist', 'worker.min.js'),
  corePath: path.join(process.cwd(), 'node_modules', 'tesseract.js-core', 'tesseract-core.wasm.js'),
} as any);
await worker.load();
await worker.loadLanguage('eng');
await worker.initialize('eng');
for (const ev of evidencesList) {
  const fileName = ev.file_url?.split('/').pop() || 'Evidence';
  try {
    const res = await fetch(ev.file_url!);
    const buf = Buffer.from(await res.arrayBuffer());
    let text = '';
    if (ev.type === 'pdf') {
      const parsed = await pdf(buf);
      text = parsed.text;
    } else {
      const { data } = await worker.recognize(buf);
      text = data.text;
    }
    const snippet = text.slice(0, 200) + (text.length > 200 ? '...' : '');
    evidenceDetails.push({ name: fileName, type: ev.type, snippet });
  } catch (e) {
    console.error('Evidence parse error:', e);
  }
}
await worker.terminate();
    console.log('DEBUG-HTML-PDF-ROUTE: evidenceDetails length', evidenceDetails.length);
    } catch (err) {
      console.error('Tesseract extraction error:', err);
      evidenceDetails = [];
    }
}

// AI Evidence Analysis
let evidenceSummary = '';
try {
  const aiPrompt = `Here are extracted evidence snippets:

${evidenceDetails.map(d => d.snippet).join('\n\n')}

Write a concise summary of key findings and gaps.`;
  evidenceSummary = await chatAI('gpt-3.5-turbo', [
    { role: 'system', content: 'You are an expert compliance analyst.' },
    { role: 'user', content: aiPrompt }
  ], 80, 0.7);
} catch (err) {
  console.error('AI evidence summary error:', err);
    console.log('DEBUG-HTML-PDF-ROUTE: evidenceSummary', evidenceSummary);
}
    if (!evidenceSummary) {
  evidenceSummary = evidenceDetails.length > 0
    ? `Processed ${evidenceDetails.length} evidence items, excerpts provided below.`
    : 'No evidence extracts were available for analysis.';
  console.log('DEBUG-HTML-PDF-ROUTE: fallback evidenceSummary', evidenceSummary);
}
const typeCounts = evidencesList.reduce((acc: Record<string, number>, e: any) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc; }, {});

const evidenceExtractsHtml = evidenceDetails.map(d => `<div class="item"><h4>${d.name} (${d.type})</h4><p>${d.snippet}</p></div>`).join('');
const evidenceFilesHtml = evidencesList.map(e => `<tr><td>${e.file_url?.split('/')?.pop() || ''}</td><td>${e.type}</td></tr>`).join('');   

    // Generate chart URLs
    const gaugeColor = summary.score > 90 ? '#4CAF50' : summary.score > 70 ? '#FF9800' : '#F44336';
    const gaugeUrl = new QuickChart()
      .setConfig({
        type: 'doughnut',
        data: { datasets: [{ data: [summary.score, 100 - summary.score], backgroundColor: [gaugeColor, '#DDDDDD'], borderWidth: 0 }] },
        options: { rotation: -Math.PI, circumference: Math.PI, cutoutPercentage: 70 }
      })
      .setWidth(300)
      .setHeight(150)
      .getUrl();
    const barUrl = new QuickChart()
      .setConfig({
        type: 'bar',
        data: { labels: ['Compliant', 'Pending', 'Non-Compliant'], datasets: [{ data: [summary.compliant, summary.pending, summary.nonCompliant], backgroundColor: ['#4CAF50', '#FF9800', '#F44336'] }] },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
      })
      .setWidth(300)
      .setHeight(150)
      .getUrl();

    // Build HTML template
    const now = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f4f4f4; }
    .container { display: grid; grid-template-columns: repeat(12,1fr); gap: 20px; padding: 40px; }
    .header { grid-column: 1 / -1; background: #fff; padding: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e0e0e0; }
    .title { font-size: 24px; font-weight: bold; }
    .datetime { font-size: 14px; color: #777; }
    .intro { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .intro .box { background: #fff; border: 1px solid #ddd; padding: 10px; border-radius: 4px; font-size: 12px; }
    .charts { grid-column: 1 / -1; display: grid; grid-template-columns: 5fr 4fr 3fr; gap: 10px; }
    .chart { background: #fff; border: 1px solid #ddd; padding: 10px; border-radius: 4px; }
    .chart img { width: 100%; height: auto; }
    .main-data { grid-column: 1 / 7; background: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 10px; }
    .main-data h3 { margin-top: 0; font-size: 16px; }
    .bar-group { display: flex; align-items: center; margin-bottom: 8px; }
    .bar { flex: 1; height: 12px; background: #eee; border-radius: 6px; overflow: hidden; margin-right: 10px; }
    .bar .fill { height: 100%; }
    .domain-stats { grid-column: 7 / -1; background: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 10px; }
    .domain-stats h3 { margin-top: 0; font-size: 16px; }
    .grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; margin-top: 10px; }
    .grid .item { background: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; padding: 8px; font-size: 12px; }
    .distribution { grid-column: 1 / 7; background: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 10px; }
    .distribution h3 { margin-top: 0; font-size: 16px; }
    .distribution .cards { display: flex; gap: 10px; margin-top: 10px; }
    .distribution .card { flex: 1; background: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; padding: 10px; text-align: center; font-size: 14px; }
    .issues { grid-column: 7 / -1; background: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 10px; }
    .issues h3 { margin-top: 0; font-size: 16px; }
    .issues table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
    .issues th, .issues td { border: 1px solid #ddd; padding: 6px; }
    .issues th { background: #f2f2f2; }
    .issues th { background: #f2f2f2; }
    .footer-notes { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-top: 20px; }
    .note { background: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 10px; height: 120px; font-size: 12px; overflow-wrap: break-word; }
    .note h4 { margin: 0; font-size: 14px; margin-bottom: 5px; }
    .note p { margin: 0; }
    .feedback { grid-column: 1 / -1; background: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 15px; margin-top: 10px; }
    .feedback h3 { margin-top: 0; font-size: 16px; }
    .feedback p { margin: 10px 0 5px; font-size: 12px; }
    .feedback ul { padding-left: 20px; margin: 0; }
    .feedback ul li { margin-bottom: 5px; }
    .exec-summary, .methodology, .contact-info { grid-column: 1 / -1; background: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 15px; }
    .exec-summary h3, .methodology h3, .contact-info h3 { margin-top: 0; font-size: 16px; }
    .methodology { margin-top: 10px; }
    .contact-info { margin-top: 20px; font-size: 12px; color: #555; }
      .evidence-detail { grid-column: 1 / -1; background: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 10px; margin-top: 10px; }
    .evidence-detail h3 { margin-top: 0; font-size: 16px; }
    .evidence-table { grid-column: 1 / -1; margin-top: 10px; }
    .evidence-table table { width: 100%; border-collapse: collapse; }
    .evidence-table th, .evidence-table td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
    .evidence-table th { background: #f2f2f2; }
      .evidence-text { grid-column: 1 / -1; background: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 10px; margin-top: 10px; }
    .evidence-text .item { margin-bottom: 10px; }
    .evidence-text .item h4 { margin: 0; font-size: 14px; }
    .evidence-text .item p { margin: 5px 0; font-size: 12px; }
    .evidence-analysis { grid-column: 1 / -1; background: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 10px; margin-top: 10px; }
    .evidence-analysis h3 { margin: 0; font-size: 14px; margin-bottom: 5px; }
    .evidence-analysis p { margin: 5px 0; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">Compliance Assessment Report</div>
      <div class="datetime">Generated: ${now}</div>
    </div>
    <div class="exec-summary"><h3>Executive Summary</h3><p>${narrative}</p></div>
    <div class="feedback">
  <h3>Feedback & Improvements</h3>
  <p>Evidence analyzed: ${evidenceCount}. You provided thorough evidence in key areas, though ${summary.pending} controls still require documentation.</p>
  <ul>${suggestions.map(s => '<li>' + s + '</li>').join('')}</ul>
</div>
    <div class="intro">
      <div class="box"><strong>Compliance Score:</strong> ${summary.score}% of controls meet requirements.</div>
      <div class="box"><strong>Evidence Completeness:</strong> Thoroughness of provided evidence.</div>
      <div class="box"><strong>Pending Items:</strong> Controls needing additional evidence (${summary.pending}).</div>
    </div>
    <div class="charts">
      <div class="chart"><h4>Compliance Gauge</h4><img src="${gaugeUrl}" /></div>
      <div class="chart"><h4>Status Breakdown</h4><img src="${barUrl}" /></div>
      <div class="chart"><h4>Top Suggestions</h4><ul>${suggestions.map(s => '<li>' + s + '</li>').join('')}</ul></div>
    </div>
    <div class="main-data">
      <h3>Control Implementation Overview</h3>
      ${[['Compliant','#4CAF50',summary.compliant],['Pending','#FF9800',summary.pending],['Non-Compliant','#F44336',summary.nonCompliant]].map(([label,color,value]:any) => `
      <div class="bar-group">
        <div class="bar"><div class="fill" style="width:${((value/summary.total)*100).toFixed(2)}%; background:${color};"></div></div>
        <span>${value} ${label}</span>
      </div>
      `).join('')}
    </div>
    <div class="domain-stats">
      <h3>Controls Detail (Top 10)</h3>
      <div class="grid">
        ${controlsList.map(c=>`<div class="item"><strong>${c.control_name}</strong><br/>${c.status}</div>`).join('')}
      </div>
    </div>
    <div class="distribution">
      <h3>Distribution of Control Status</h3>
      <div class="cards">
        <div class="card"><strong>Compliant</strong><br/>${summary.compliant}</div>
        <div class="card"><strong>Pending</strong><br/>${summary.pending}</div>
        <div class="card"><strong>Non-Compliant</strong><br/>${summary.nonCompliant}</div>
      </div>
    </div>
        <div class="evidence-analysis">
      <h3>Evidence Analysis</h3>
      <p>${evidenceSummary}</p>
    </div>
        <div class="evidence-detail">
      <h3>Evidence by Type</h3>
      <div class="grid">
        ${Object.entries(typeCounts).map(([type, count]) => '<div class="item"><strong>' + type + '</strong><br/>' + count + '</div>').join('')}
      </div>
    </div>
        <div class="evidence-text">
      <h3>Evidence Extracts</h3>
      ${evidenceExtractsHtml}

    </div>
        <div class="evidence-table">
      <h3>Evidence Files</h3>
      <table>
        <thead><tr><th>File</th><th>Type</th></tr></thead>
        <tbody>${evidenceFilesHtml}</tbody>
      </table>
    </div>
    <div class="issues">
      <h3>Top Controls to Address</h3>
      <table>
        <thead><tr><th>Control</th><th>Status</th></tr></thead>
        <tbody>${controlsList.map(c=>`<tr><td>${c.control_name}</td><td>${c.status}</td></tr>`).join('')}</tbody>
      </table>
    </div>
    <div class="footer-notes">
      <div class="note"><h4>Areas for Improvement</h4><p></p></div>
      <div class="note"><h4>Suggestions</h4><p></p></div>
      <div class="note"><h4>Related Matters</h4><p></p></div>
    </div>
  </div>
    <div class="contact-info"><h3>Contact Information</h3><p>Compliance Team | compliance@yourcompany.com | +1 (555) 123-4567</p></div>
</body>
</html>
`;

    // Render PDF via Puppeteer
    const chromium = eval("require")("chrome-aws-lambda");
    const puppeteerCore = eval("require")("puppeteer-core");
    const puppeteer = process.env.NODE_ENV === "development" ? require("puppeteer") : puppeteerCore;

    let browser: any;
    try {
      browser = await puppeteer.launch(
        process.env.NODE_ENV === "development"
          ? { headless: true }
          : {
              args: chromium.args,
              executablePath: await chromium.executablePath,
              headless: chromium.headless,
            }
      );
    } catch (e) {
      console.error("Puppeteer launch failed, falling back:", e);
      browser = await require("puppeteer").launch({ headless: true });
    }
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, displayHeaderFooter: true, margin: { top: '60px', bottom: '60px', left: '40px', right: '40px' }, headerTemplate: `<div style="font-size:10px; color:#777; width:100%; text-align:center; padding-top:10px;">Compliance Assessment Report</div>`, footerTemplate: `<div style="font-size:10px; color:#777; width:100%; text-align:center; padding-bottom:10px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>` });
    await browser.close();

    console.log('DEBUG-HTML-PDF-ROUTE: returning PDF, size =', pdfBuffer.byteLength);
    return new NextResponse(pdfBuffer, { status: 200, headers: { 'Content-Type': 'application/pdf' } });
  }).catch(error => {
    console.error('Error generating HTML-PDF report:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate HTML-PDF report' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  });
}

export const runtime = 'nodejs';
