'use server'

import { supabaseAdmin } from '@/lib/supabase';

export async function updateArticleStatus(articleId: string, status: 'read' | 'read_later' | 'archived') {
  const { error } = await supabaseAdmin
    .from('user_article_status')
    .upsert(
      { article_id: articleId, status },
      { onConflict: 'article_id' }
    );
    
  if (error) {
    console.error('Error updating status:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

