-- Migration: Create Sortex daily and weekly summary tables
-- Date: 2025-01-02

-- Create sortex_daily_summaries table
CREATE TABLE IF NOT EXISTS sortex_daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  samples_count INTEGER NOT NULL DEFAULT 0,
  avg_foreign_matter NUMERIC(5,2),
  avg_odor NUMERIC(5,2),
  avg_discolored NUMERIC(5,2),
  avg_different_variety NUMERIC(5,2),
  avg_moisture NUMERIC(5,2),
  avg_splits NUMERIC(5,2),
  avg_shrivelled NUMERIC(5,2),
  avg_live_insects NUMERIC(5,2),
  week_num INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sortex_weekly_summaries table
CREATE TABLE IF NOT EXISTS sortex_weekly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_num INTEGER NOT NULL,
  year INTEGER NOT NULL,
  avg_foreign_matter NUMERIC(5,2),
  avg_odor NUMERIC(5,2),
  avg_discolored NUMERIC(5,2),
  avg_different_variety NUMERIC(5,2),
  avg_moisture NUMERIC(5,2),
  avg_splits NUMERIC(5,2),
  avg_shrivelled NUMERIC(5,2),
  avg_live_insects NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(week_num, year)
);

-- Add comments for documentation
COMMENT ON TABLE sortex_daily_summaries IS 'Daily Sortex QC summary auto-calculated from hourly QA checks';
COMMENT ON COLUMN sortex_daily_summaries.date IS 'Date of the daily summary';
COMMENT ON COLUMN sortex_daily_summaries.samples_count IS 'Number of samples taken on this date';
COMMENT ON COLUMN sortex_daily_summaries.avg_foreign_matter IS 'Average foreign matter percentage';
COMMENT ON COLUMN sortex_daily_summaries.avg_odor IS 'Average odor score';
COMMENT ON COLUMN sortex_daily_summaries.avg_discolored IS 'Average discolored percentage';
COMMENT ON COLUMN sortex_daily_summaries.avg_different_variety IS 'Average different variety percentage';
COMMENT ON COLUMN sortex_daily_summaries.avg_moisture IS 'Average moisture percentage';
COMMENT ON COLUMN sortex_daily_summaries.avg_splits IS 'Average splits percentage';
COMMENT ON COLUMN sortex_daily_summaries.avg_shrivelled IS 'Average shrivelled percentage';
COMMENT ON COLUMN sortex_daily_summaries.avg_live_insects IS 'Average live insects count';
COMMENT ON COLUMN sortex_daily_summaries.week_num IS 'ISO week number';

COMMENT ON TABLE sortex_weekly_summaries IS 'Weekly Sortex QC summary auto-calculated from daily summaries';
COMMENT ON COLUMN sortex_weekly_summaries.week_num IS 'ISO week number';
COMMENT ON COLUMN sortex_weekly_summaries.year IS 'Year';
COMMENT ON COLUMN sortex_weekly_summaries.avg_foreign_matter IS 'Average foreign matter percentage for the week';
COMMENT ON COLUMN sortex_weekly_summaries.avg_odor IS 'Average odor score for the week';
COMMENT ON COLUMN sortex_weekly_summaries.avg_discolored IS 'Average discolored percentage for the week';
COMMENT ON COLUMN sortex_weekly_summaries.avg_different_variety IS 'Average different variety percentage for the week';
COMMENT ON COLUMN sortex_weekly_summaries.avg_moisture IS 'Average moisture percentage for the week';
COMMENT ON COLUMN sortex_weekly_summaries.avg_splits IS 'Average splits percentage for the week';
COMMENT ON COLUMN sortex_weekly_summaries.avg_shrivelled IS 'Average shrivelled percentage for the week';
COMMENT ON COLUMN sortex_weekly_summaries.avg_live_insects IS 'Average live insects count for the week';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sortex_daily_summaries_date ON sortex_daily_summaries(date);
CREATE INDEX IF NOT EXISTS idx_sortex_daily_summaries_week_num ON sortex_daily_summaries(week_num);
CREATE INDEX IF NOT EXISTS idx_sortex_weekly_summaries_week_year ON sortex_weekly_summaries(week_num, year);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sortex_daily_summaries_updated_at
BEFORE UPDATE ON sortex_daily_summaries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sortex_weekly_summaries_updated_at
BEFORE UPDATE ON sortex_weekly_summaries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
