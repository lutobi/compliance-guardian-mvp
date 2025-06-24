'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function AINarrativePage() {
  const [input, setInput] = useState('');
  const [narrative, setNarrative] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setNarrative('');
    try {
      const data = JSON.parse(input);
      const res = await fetch('/api/ai/narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complianceData: data }),
      });
      const result = await res.json();
      if (res.ok) setNarrative(result.narrative);
      else setError(result.error || 'Generation failed');
    } catch {
      setError('Invalid JSON or request error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">AI-Powered Compliance Narrative</h1>
      <textarea
        className="w-full h-40 p-2 border rounded mb-4"
        placeholder="Paste complianceData JSON"
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <Button onClick={handleGenerate} disabled={loading} className="mb-4">
        {loading ? 'Generating...' : 'Generate Narrative'}
      </Button>
      {error && <p className="mt-2 text-red-600">Error: {error}</p>}
      {narrative && (
        <div className="mt-6 p-4 bg-gray-50 border rounded">
          <h2 className="text-xl font-semibold mb-2">Narrative</h2>
          <pre className="whitespace-pre-wrap">{narrative}</pre>
        </div>
      )}
    </div>
  );
}
