-- Create sortex_hourly_records table for hourly Sortex checklist data
CREATE TABLE IF NOT EXISTS public.sortex_hourly_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  form_date DATE,
  check_time TIME,
  moisture DECIMAL(5,2),
  foreign_matter DECIMAL(5,2),
  odor DECIMAL(5,2),
  discolored DECIMAL(5,2),
  different_variety DECIMAL(5,2),
  splits DECIMAL(5,2),
  shrivelled DECIMAL(5,2),
  live_insects DECIMAL(5,2),
  remarks TEXT,
  analyst_name TEXT,
  analyst_signature TEXT,
  signed_date DATE,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sortex_hourly_records_batch_id ON public.sortex_hourly_records(batch_id);
CREATE INDEX IF NOT EXISTS idx_sortex_hourly_records_form_date ON public.sortex_hourly_records(form_date);
CREATE INDEX IF NOT EXISTS idx_sortex_hourly_records_check_time ON public.sortex_hourly_records(check_time);

-- Enable Row Level Security
ALTER TABLE public.sortex_hourly_records ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all sortex hourly records"
  ON public.sortex_hourly_records FOR SELECT
  USING (true);

CREATE POLICY "Users can insert sortex hourly records"
  ON public.sortex_hourly_records FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update sortex hourly records"
  ON public.sortex_hourly_records FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete sortex hourly records"
  ON public.sortex_hourly_records FOR DELETE
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_sortex_hourly_records_updated_at
  BEFORE UPDATE ON public.sortex_hourly_records
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
