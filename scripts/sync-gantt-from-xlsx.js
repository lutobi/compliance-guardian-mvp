/*
  sync-gantt-from-xlsx.js
  - Reads: deliverables/pep/Chevron Lekki Critical Power Equipment (RMU) Monitoring Project Schedule 2.xlsx
  - Writes: deliverables/pep/lekki_rmu_gantt_a3.html (replacing tasks section) using exact wording
*/

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const XLSX_PATH = path.resolve(__dirname, '..', 'deliverables', 'pep', 'Chevron Lekki Critical Power Equipment (RMU) Monitoring Project Schedule 2.xlsx');
const HTML_PATH = path.resolve(__dirname, '..', 'deliverables', 'pep', 'lekki_rmu_gantt_a3.html');

// Timeline window used by the A3 Gantt (17 weeks: Aug W3 – Dec W3)
const TIMELINE_START = new Date('2025-08-18'); // Mon of Aug W3
const TIMELINE_END = new Date('2025-12-15');   // Mon of Dec W3 end week

function parseWorkbook(filePath) {
  const wb = XLSX.readFile(filePath);
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  let rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
  // Determine if we have a 'Task' header; if not, fallback to header:1 approach
  const hasTaskHeader = rows.length > 0 && Object.keys(rows[0]).some(k => String(k).trim().toLowerCase().includes('task'));
  if (!rows.length || !hasTaskHeader) {
    const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    if (raw.length) {
      // Find header row by locating a row containing the word 'Task'
      let headerIdx = raw.findIndex(r => r.some(c => String(c).toLowerCase().includes('task')));
      if (headerIdx === -1) headerIdx = 0;
      const headers = raw[headerIdx].map(h => String(h).trim());
      const body = raw.slice(headerIdx + 1);
      rows = body.map(r => {
        const obj = {};
        headers.forEach((h, i) => { obj[h] = r[i] ?? ''; });
        return obj;
      });
    }
  }
  // Expect columns: No., Start, End, Task (order may vary). Try to map by header names.
  // Normalize keys.
  return rows.map((r) => {
    const obj = {};
    for (const k of Object.keys(r)) {
      const nk = String(k).trim().toLowerCase();
      obj[nk] = r[k];
    }
    const task = obj['task'] || obj['tasks'] || '';
    const start = obj['start'] || '';
    const end = obj['end'] || '';
    const no = obj['no.'] ?? obj['no'] ?? obj['#'] ?? '';
    return { no, start, end, task };
  }).filter(r => String(r.task).trim().length > 0);
}

function parseDate(val) {
  if (!val) return null;
  // XLSX may provide Date objects or strings
  if (val instanceof Date) return val;
  if (typeof val === 'number') {
    // Excel serial date: days since 1899-12-30
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const ms = val * 24 * 3600 * 1000;
    return new Date(epoch.getTime() + ms);
  }
  const s = String(val).trim();
  if (!s) return null;
  // Try various formats like M/D/YY or M/D/YYYY
  const d = new Date(s);
  if (!isNaN(d)) return d;
  return null;
}

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function posFromDates(start, end) {
  const totalMs = TIMELINE_END - TIMELINE_START;
  if (totalMs <= 0) return { left: 0, width: 0 };
  const s = start ? Math.max(start - TIMELINE_START, 0) : 0;
  const e = end ? Math.min(end - TIMELINE_START, totalMs) : s + (5 * 24 * 3600 * 1000); // default 5 days if missing end
  const left = clamp((s / totalMs) * 100, 0, 100);
  const width = clamp(((e - s) / totalMs) * 100, 0.8, 100 - left); // min width ~0.8%
  return { left, width };
}

function fmtRange(start, end) {
  if (!start && !end) return '';
  const f = (d) => d ? d : null;
  const s = f(start), e = f(end);
  if (!s && e) return `${formatDate(e)}`;
  if (s && !e) return `${formatDate(s)}`;
  return `${formatDate(s)} – ${formatDate(e, s)}`;
}

function formatDate(d, ref) {
  // Show like: Sep 03 (omit year if same as ref or 2025 implied)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const m = months[d.getMonth()];
  const day = String(d.getDate()).padStart(2,'0');
  const year = d.getFullYear();
  const showYear = ref ? (ref.getFullYear() !== year) : false;
  return `${m} ${day}${showYear ? `, ${year}` : ''}`;
}

function buildRows(items) {
  // Group logic: a row with Start or End is treated as a main section; following rows with no Start/End are subtasks until next dated row.
  const groups = [];
  let current = null;
  for (const it of items) {
    const start = parseDate(it.start);
    const end = parseDate(it.end);
    const hasDates = !!(start || end);
    if (hasDates) {
      current = { title: it.task, start, end, subtasks: [] };
      groups.push(current);
    } else if (current) {
      current.subtasks.push({ title: it.task });
    } else {
      // If no current group yet, treat as its own main with no dates
      current = { title: it.task, start: null, end: null, subtasks: [] };
      groups.push(current);
    }
  }

  // Generate HTML rows
  const parts = [];
  for (const g of groups) {
    // Main row
    const { left, width } = posFromDates(g.start, g.end);
    const colorClass = colorClassFor(g.title);
    const mainPrefix = fmtRange(g.start, g.end);
    parts.push(
`    <div class="row main">
      <div class="task-label col-task">${mainPrefix ? `<span style="color:#64748b;font-weight:600">${escapeHtml(mainPrefix)}</span> — ` : ''}${escapeHtml(g.title)}</div>
      <div class="bars col-time">
        <div class="week-grid"> <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div> </div>
        <div class="bar ${colorClass}" style="left: ${left.toFixed(1)}%; width: ${width.toFixed(1)}%;">${escapeHtml(g.title)}</div>
      </div>
    </div>`);

    // Subtasks
    const n = g.subtasks.length;
    for (let i = 0; i < n; i++) {
      const s = g.subtasks[i];
      let subLeft = left, subWidth = Math.max(width * 0.2, 0.8);
      let subStart = g.start, subEnd = g.end;
      if (g.start && g.end && width > 0) {
        const slice = width / Math.max(n, 1);
        subLeft = left + slice * i + slice * 0.1; // small inner padding
        subWidth = slice * 0.8; // leave margins between bars
        // derive subtask date range from slice
        const totalMs = g.end - g.start;
        const sliceMs = totalMs / Math.max(n, 1);
        subStart = new Date(g.start.getTime() + sliceMs * i);
        subEnd = new Date(subStart.getTime() + sliceMs * 0.8);
      }
      const subPrefix = fmtRange(subStart, subEnd);
      parts.push(
`    <div class="row">
      <div class="subtask-label col-task">${subPrefix ? `<span style="color:#94a3b8">${escapeHtml(subPrefix)}</span> — ` : ''}${escapeHtml(s.title)}</div>
      <div class="bars col-time"><div class="bar ${colorClass}" style="left: ${subLeft.toFixed(1)}%; width: ${subWidth.toFixed(1)}%;">${escapeHtml(s.title)}</div></div>
    </div>`);
    }
  }
  return parts.join('\n');
}

function colorClassFor(title) {
  const t = String(title).toLowerCase();
  if (t.includes('kickoff')) return 'c-kick';
  if (t.includes('site survey') || t.includes('survey')) return 'c-surv';
  if (t.includes('engineering')) return 'c-eng';
  if (t.includes('procurement')) return 'c-proc';
  if (t.includes('site installation') || t === 'site installation ') return 'c-site';
  if (t.includes('integration')) return 'c-intg';
  if (t.includes('isat') || t.includes('commission')) return 'c-test';
  if (t.includes('moc') || t.includes('as-built') || t.includes('documentation')) return 'c-doc';
  if (t.includes('handover') || t.includes('handing over') || t.includes('demobil')) return 'c-hand';
  // default integration color if unknown
  return 'c-intg';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function replaceTaskSection(html, newRows) {
  // Replace everything from the first task rows marker to before the legend
  // We'll anchor after the weeks section and before the legend div.
  const startAnchor = '<!-- Note: 1 week = 5.882% of width. left/width approximated from provided schedule. -->';
  const endAnchor = '<!-- Legend -->';
  const startIdx = html.indexOf(startAnchor);
  const endIdx = html.indexOf(endAnchor);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error('Could not locate anchors in HTML to replace task section.');
  }
  const before = html.slice(0, startIdx + startAnchor.length);
  const after = html.slice(endIdx);

  const injected = `\n\n${newRows}\n\n`;
  return before + injected + after;
}

function run() {
  if (!fs.existsSync(XLSX_PATH)) {
    console.error('Excel file not found:', XLSX_PATH);
    process.exit(1);
  }
  if (!fs.existsSync(HTML_PATH)) {
    console.error('HTML file not found:', HTML_PATH);
    process.exit(1);
  }

  const items = parseWorkbook(XLSX_PATH);
  if (!items.length) {
    // Diagnostics
    try {
      const wb = XLSX.readFile(XLSX_PATH);
      console.error('No rows parsed from Excel. Sheet names:', wb.SheetNames);
      const ws0 = wb.Sheets[wb.SheetNames[0]];
      const head = XLSX.utils.sheet_to_json(ws0, { header: 1, range: 0, defval: '' }).slice(0, 10);
      console.error('First rows preview:', head);
    } catch (e) {
      console.error('Diagnostics failed:', e.message);
    }
    process.exit(1);
  }

  const rowsHtml = buildRows(items);
  const html = fs.readFileSync(HTML_PATH, 'utf8');
  const out = replaceTaskSection(html, rowsHtml);
  fs.writeFileSync(HTML_PATH, out, 'utf8');
  console.log(`Updated ${HTML_PATH} with ${items.length} items.`);
}

run();
