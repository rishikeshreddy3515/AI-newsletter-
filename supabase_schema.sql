-- Run this SQL in your Supabase SQL Editor

-- 1. Sources table
CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    url TEXT,
    rss_url TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Articles table
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE, -- to avoid dupes from same RSS
    author TEXT,
    description TEXT,
    category TEXT,
    publication_date TIMESTAMPTZ,
    ingestion_date TIMESTAMPTZ DEFAULT NOW(),
    canonical_url TEXT -- for deduplication across sources
);

-- 3. Article Analysis table
CREATE TABLE article_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE UNIQUE,
    category TEXT,
    importance_score INTEGER CHECK (importance_score >= 0 AND importance_score <= 100),
    novelty_score INTEGER CHECK (novelty_score >= 0 AND novelty_score <= 100),
    technical_relevance_score INTEGER CHECK (technical_relevance_score >= 0 AND technical_relevance_score <= 100),
    research_value_score INTEGER CHECK (research_value_score >= 0 AND research_value_score <= 100),
    industry_impact_score INTEGER CHECK (industry_impact_score >= 0 AND industry_impact_score <= 100),
    short_headline TEXT,
    one_sentence_summary TEXT,
    detailed_summary TEXT,
    why_it_matters TEXT,
    key_technical_details TEXT,
    related_topics TEXT[],
    is_worth_including BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Newsletters table
CREATE TABLE newsletters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE UNIQUE NOT NULL,
    content_json JSONB,
    html_content TEXT,
    is_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. User Article Status table
CREATE TABLE user_article_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE UNIQUE,
    status TEXT CHECK (status IN ('unread', 'read', 'read_later', 'archived')) DEFAULT 'unread',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial sources
INSERT INTO sources (name, rss_url, url, category, priority) VALUES
('OpenAI Blog', 'https://openai.com/blog/rss.xml', 'https://openai.com/blog', 'Models', 10),
('Google DeepMind Blog', 'https://deepmind.google/blog/rss.xml', 'https://deepmind.google/blog', 'Research', 10),
('Hugging Face Blog', 'https://huggingface.co/blog/feed.xml', 'https://huggingface.co/blog', 'Open Source', 9),
('Anthropic News', 'https://www.anthropic.com/news/rss.xml', 'https://www.anthropic.com/news', 'Models', 10);
