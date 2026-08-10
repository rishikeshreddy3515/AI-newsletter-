import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  const { data, error } = await supabase.from('article_analysis').select('id, article_id, is_worth_including, importance_score');
  console.log("Analysis data:", data);
  console.log("Error:", error);
}

check();
