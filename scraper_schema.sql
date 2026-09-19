-- 1. Create the scraper state table
CREATE TABLE IF NOT EXISTS scraper_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  last_date_scraped DATE NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the starting point (e.g., today's date) if it doesn't exist
INSERT INTO scraper_state (id, last_date_scraped)
VALUES (1, CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

-- 2. Add new columns to the tenders table for historical data and results
ALTER TABLE tenders
ADD COLUMN IF NOT EXISTS status TEXT,
ADD COLUMN IF NOT EXISTS winner_name TEXT,
ADD COLUMN IF NOT EXISTS winning_amount NUMERIC,
ADD COLUMN IF NOT EXISTS awarded_date DATE,
ADD COLUMN IF NOT EXISTS source_url TEXT;

-- 3. Update permissions for the scraper_state table
ALTER TABLE scraper_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to scraper_state" ON scraper_state
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous update to scraper_state" ON scraper_state
  FOR UPDATE USING (true);
  
CREATE POLICY "Allow anonymous insert to scraper_state" ON scraper_state
  FOR INSERT WITH CHECK (true);
