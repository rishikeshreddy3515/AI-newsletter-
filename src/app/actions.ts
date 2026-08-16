'use server'

import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function removeSavedArticle(articleId: string) {
  await updateArticleStatus(articleId, { is_saved: false });
  revalidatePath('/read-later');
}

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

export async function wipeSavedArticles() {
  const { error } = await supabaseAdmin
    .from('user_article_status')
    .delete()
    .eq('is_saved', true);

  if (error) {
    console.error('Error wiping saved articles:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function cleanupDatabase() {
  const now = new Date();
  
  // 1 Day Ago
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  
  // Last Sunday Midnight
  const lastSunday = new Date(now);
  lastSunday.setDate(lastSunday.getDate() - lastSunday.getDay());
  lastSunday.setHours(0, 0, 0, 0);
  const lastSundayStr = lastSunday.toISOString();

  // Due to Supabase RPC limitations, we'll do two separate delete calls
  // 1. Delete read articles older than 1 day
  const { error: readError } = await supabaseAdmin
    .from('user_article_status')
    .delete()
    .eq('is_read', true)
    .lt('updated_at', oneDayAgo);

  // 2. Delete saved articles older than last Sunday
  const { error: savedError } = await supabaseAdmin
    .from('user_article_status')
    .delete()
    .eq('is_saved', true)
    .lt('updated_at', lastSundayStr);

  if (readError || savedError) {
    console.error('Error during database cleanup:', readError || savedError);
    return { success: false, error: (readError || savedError)?.message };
  }
  return { success: true };
}
