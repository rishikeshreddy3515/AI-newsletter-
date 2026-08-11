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
    <main className="max-w-3xl mx-auto px-4 py-8 pb-24">
      <h1 className="text-3xl font-extrabold mb-2">Developer Tools</h1>
      <p className="text-gray-500 mb-6">Manually trigger the background jobs for testing.</p>

      <div className="mb-8">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          CRON_SECRET (Authorization Bearer Token)
        </label>
        <input 
          type="password" 
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Paste your production CRON_SECRET here..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => trigger('ingest')}
          disabled={loading !== null}
          className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-500 transition disabled:opacity-50"
        >
          {loading === 'ingest' ? <Loader2 className="animate-spin text-blue-500" size={32} /> : <Rss className="text-orange-500" size={32} />}
          <span className="font-bold">1. Run Ingestion</span>
        </button>

        <button
          onClick={() => trigger('analyze')}
          disabled={loading !== null}
          className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-500 transition disabled:opacity-50"
        >
          {loading === 'analyze' ? <Loader2 className="animate-spin text-blue-500" size={32} /> : <Bot className="text-purple-500" size={32} />}
          <span className="font-bold">2. Run AI Analysis</span>
        </button>

        <button
          onClick={() => trigger('newsletter')}
          disabled={loading !== null}
          className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-500 transition disabled:opacity-50"
        >
          {loading === 'newsletter' ? <Loader2 className="animate-spin text-blue-500" size={32} /> : <Mail className="text-green-500" size={32} />}
          <span className="font-bold">3. Generate & Email</span>
        </button>
      </div>

      {result && (
        <div className="bg-gray-900 text-green-400 p-6 rounded-2xl overflow-auto border border-gray-800 shadow-inner">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Play size={16} /> Result: /{result.endpoint}
          </h3>
          <pre className="text-sm">
            {JSON.stringify(result.data || result.error, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
