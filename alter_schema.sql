-- Add image_url to articles to support the new visual card design
ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add editorial_comment to article_analysis for the Cartoon Mascot
ALTER TABLE article_analysis ADD COLUMN IF NOT EXISTS editorial_comment TEXT;
