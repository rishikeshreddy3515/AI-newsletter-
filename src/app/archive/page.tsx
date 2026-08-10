import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ArchivePage() {
  const { data: newsletters, error } = await supabaseAdmin
    .from('newsletters')
    .select('id, date, is_sent')
    .order('date', { ascending: false });

  if (error) {
    return <div>Error loading archive.</div>;
  }

  if (!newsletters || newsletters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-bold mb-2">Archive is empty</h2>
        <p className="text-gray-500">No newsletters have been generated yet.</p>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 pb-24">
      <h1 className="text-3xl font-extrabold mb-8">Newsletter Archive</h1>
      
      <div className="flex flex-col gap-4">
        {newsletters.map((nl: any) => (
          <Link 
            key={nl.id} 
            href={`/archive/${nl.id}`}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition flex items-center justify-between"
          >
            <div>
              <h2 suppressHydrationWarning className="text-xl font-bold mb-1">
                {new Date(nl.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h2>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${nl.is_sent ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {nl.is_sent ? 'Sent via Email' : 'Draft'}
              </span>
            </div>
            <div className="text-gray-400">→</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
