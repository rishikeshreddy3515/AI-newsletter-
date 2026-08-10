'use server'

import { supabaseAdmin } from '@/lib/supabase';

export async function updateArticleStatus(
  articleId: string, 
  updates: { is_read?: boolean; is_saved?: boolean }
) {
  // First, we need to get the existing status so we don't overwrite the other boolean
  const { data: existing } = await supabaseAdmin
    .from('user_article_status')
    .select('*')
    .eq('article_id', articleId)
    .single();

  const newStatus = {
    article_id: articleId,
    is_read: updates.is_read !== undefined ? updates.is_read : (existing?.is_read || false),
    is_saved: updates.is_saved !== undefined ? updates.is_saved : (existing?.is_saved || false),
    // We keep status as 'read' or 'read_later' just for backward compatibility if any old code relies on it
    status: updates.is_saved ? 'read_later' : (updates.is_read ? 'read' : 'unread')
  };

  const { error } = await supabaseAdmin
    .from('user_article_status')
    .upsert(newStatus, { onConflict: 'article_id' });
    
  if (error) {
    console.error('Error updating status:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

