#!/usr/bin/env node
/**
 * Script to prepend 'use client' directive to Next.js client components.
 */

const fs = require('fs');
const path = require('path');

// List of files requiring 'use client' directive
const files = [
  'src/app/dashboard/frameworks/[slug]/page.tsx',
  'src/components/assessments/AssessmentClient.tsx'
];

files.forEach(relPath => {
  const filePath = path.resolve(process.cwd(), relPath);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${relPath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.startsWith("'use client'")) {
    console.log(`${relPath} already has 'use client'`);
    return;
  }
  // Prepend directive
  content = `'use client';\n${content}`;
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Prepended 'use client' to ${relPath}`);
});
