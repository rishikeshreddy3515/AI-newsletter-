'use client';

import { useState } from 'react';
import { Play, Loader2, Mail, Bot, Rss } from 'lucide-react';

export default function DevPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [secret, setSecret] = useState('super-secret-key-for-manual-cron');

  const trigger = async (endpoint: string) => {
    setLoading(endpoint);
    setResult(null);
    try {
      const res = await fetch(`/api/cron/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secret}`
        }
      });
      const data = await res.json();
      setResult({ endpoint, status: res.status, data });
    } catch (err: any) {
      setResult({ endpoint, error: err.message });
    }
    setLoading(null);
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 pb-24 text-foreground">
      <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Developer Tools</h1>
      <p className="text-text-secondary mb-6 font-medium">Manually trigger the background jobs for testing.</p>

      <div className="mb-8">
        <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-widest text-[10px]">
          CRON_SECRET (Authorization Bearer Token)
        </label>
        <input 
          type="password" 
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-sage/20 bg-background text-foreground font-mono focus:outline-none focus:border-sage/50 transition-colors"
          placeholder="Paste your production CRON_SECRET here..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => trigger('ingest')}
          disabled={loading !== null}
          className="flex flex-col items-center justify-center gap-3 bg-sage-soft/10 p-6 rounded-2xl border border-sage/20 shadow-sm hover:shadow-md hover:border-sage/40 transition disabled:opacity-50 text-foreground"
        >
          {loading === 'ingest' ? <Loader2 className="animate-spin text-sage" size={32} /> : <Rss className="text-sage" size={32} />}
          <span className="font-bold">1. Run Ingestion</span>
        </button>

        <button
          onClick={() => trigger('analyze')}
          disabled={loading !== null}
          className="flex flex-col items-center justify-center gap-3 bg-sage-soft/10 p-6 rounded-2xl border border-sage/20 shadow-sm hover:shadow-md hover:border-sage/40 transition disabled:opacity-50 text-foreground"
        >
          {loading === 'analyze' ? <Loader2 className="animate-spin text-sage" size={32} /> : <Bot className="text-gold" size={32} />}
          <span className="font-bold">2. Run AI Analysis</span>
        </button>

        <button
          onClick={() => trigger('newsletter')}
          disabled={loading !== null}
          className="flex flex-col items-center justify-center gap-3 bg-sage-soft/10 p-6 rounded-2xl border border-sage/20 shadow-sm hover:shadow-md hover:border-sage/40 transition disabled:opacity-50 text-foreground"
        >
          {loading === 'newsletter' ? <Loader2 className="animate-spin text-sage" size={32} /> : <Mail className="text-sage" size={32} />}
          <span className="font-bold">3. Generate & Email</span>
        </button>
      </div>

      {result && (
        <div className="bg-sage-soft/20 text-foreground p-6 rounded-2xl overflow-auto border border-sage/30 shadow-inner">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Play size={16} className="text-sage" /> Result: /{result.endpoint}
          </h3>
          <pre className="text-sm font-mono text-text-secondary whitespace-pre-wrap">
            {JSON.stringify(result.data || result.error, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
