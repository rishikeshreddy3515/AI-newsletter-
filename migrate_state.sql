-- 1. Add new boolean columns to the user_article_status table
ALTER TABLE user_article_status ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE user_article_status ADD COLUMN IF NOT EXISTS is_saved BOOLEAN DEFAULT false;

-- 2. Migrate existing data from the legacy 'status' text column
UPDATE user_article_status SET is_read = true WHERE status = 'read';
UPDATE user_article_status SET is_saved = true WHERE status = 'read_later';

-- (Optional) If you want to drop the old status column later, you can run:
-- ALTER TABLE user_article_status DROP COLUMN status;
