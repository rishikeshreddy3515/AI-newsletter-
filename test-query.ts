import { createClient } from '@supabase/supabase-js';

async function runTestQuery() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqawaanvpdmvraizimaw.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  console.log('Testing connection to Supabase at:', supabaseUrl);
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: articles, error, count } = await supabase
      .from('articles')
      .select('id, title, category, publication_date', { count: 'exact' })
      .limit(5);

    if (error) {
      console.error('Supabase query error:', error.message);
      return;
    }

    console.log(`Successfully fetched articles! Total count: ${count}`);
    console.log('Preview articles:', articles);
  } catch (err: any) {
    console.error('Connection exception:', err?.message || err);
  }
}

runTestQuery().catch(console.error);

