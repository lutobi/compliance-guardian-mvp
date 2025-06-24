import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { complianceData } = req.body;
  if (!complianceData) {
    return res.status(400).json({ error: 'Missing complianceData' });
  }

  try {
    const prompt = `Generate a concise compliance narrative based on the following data: ${JSON.stringify(complianceData)}`;
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an AI assistant that writes compliance narratives.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500
    });

    const narrative = response.choices?.[0]?.message?.content || '';
    return res.status(200).json({ narrative });
  } catch (error) {
    console.error('AI narrative generation failed:', error);
    return res.status(500).json({ error: 'AI generation failed' });
  }
}
