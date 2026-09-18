-- Run this in the Supabase SQL Editor to create the tenders table

CREATE TABLE IF NOT EXISTS tenders (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  title_ar TEXT,
  title_en TEXT,
  buyer TEXT,
  buyer_ar TEXT,
  buyer_en TEXT,
  city TEXT,
  city_ar TEXT,
  city_en TEXT,
  deadline TIMESTAMPTZ,
  estimated_cost NUMERIC,
  category TEXT,
  category_ar TEXT,
  category_en TEXT,
  description TEXT,
  description_ar TEXT,
  description_en TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow anonymous read access (since it's public data)
ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON tenders
  FOR SELECT
  USING (true);
  
-- Allow anonymous insert (for our scraper) - in production you'd use a service role key, but this is fine for now
CREATE POLICY "Allow anonymous insert" ON tenders
  FOR INSERT
  WITH CHECK (true);
