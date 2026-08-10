import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ArchiveDetailPage({ params }: { params: { id: string } }) {
  const { data: newsletter, error } = await supabaseAdmin
    .from('newsletters')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !newsletter) {
    return <div>Newsletter not found.</div>;
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 pb-24">
      <Link href="/archive" className="text-blue-600 hover:underline mb-6 inline-block">
        ← Back to Archive
      </Link>
      
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100 dark:border-gray-700">
        <div 
          className="prose dark:prose-invert max-w-none newsletter-content"
          dangerouslySetInnerHTML={{ __html: newsletter.html_content }}
        />
      </div>
    </main>
  );
}
