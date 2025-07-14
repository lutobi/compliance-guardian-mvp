import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

let OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  try {
    OPENAI_API_KEY = fs.readFileSync(path.join(process.cwd(), 'credentials/openai.key'), 'utf-8').trim();
    console.log('DEBUG-NARRATIVE-ROUTE: Loaded OPENAI_API_KEY from credentials/openai.key');
  } catch (e) {
    console.warn('DEBUG-NARRATIVE-ROUTE: OpenAI key not found in env or credentials file.');
  }
}
console.log('DEBUG-NARRATIVE-ROUTE: OPENAI_API_KEY present =', !!OPENAI_API_KEY);
const requestSchema = z.object({ assessmentId: z.string().uuid() });

export async function GET(request: Request) {
  console.log('DEBUG-NARRATIVE-ROUTE: invoked, OPENAI_API_KEY present =', !!OPENAI_API_KEY);
  if (!OPENAI_API_KEY) {
    console.error('Missing OpenAI API key');
    return NextResponse.json({ narrative: '' });
  }
  const { searchParams } = new URL(request.url);
  const assessmentId = searchParams.get('assessmentId');
  if (!assessmentId || !requestSchema.safeParse({ assessmentId }).success) {
    return NextResponse.json({ narrative: '' }, { status: 400 });
  }
  const origin = request.headers.get('origin') || new URL(request.url).origin;
  const summaryRes = await fetch(`${origin}/api/report/summary?assessmentId=${assessmentId}`);
  if (!summaryRes.ok) {
    console.error('Summary API error', summaryRes.statusText);
    return NextResponse.json({ narrative: '' });
  }
  const { score, compliant, nonCompliant, pending, total } = await summaryRes.json();

  const prompt = `You are an expert compliance reporting assistant. Generate a concise (2–3 sentence) narrative summarizing these results:\n- Compliance score: ${score}%\n- Compliant: ${compliant}/${total}\n- Non-compliant: ${nonCompliant}/${total}\n- Pending: ${pending}/${total}`;

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
      console.error('OpenAI API error', await response.text());
      return NextResponse.json({ narrative: '' });
    }
    const data = await response.json();
    const narrative = data.choices?.[0]?.message?.content?.trim() || '';
    return NextResponse.json({ narrative });
  } catch (err) {
    console.error('OpenAI error:', err);
    return NextResponse.json({ narrative: '' });
  }
}
