-- Migration: Update incoming_receipts table to match paper form structure
-- Date: 2025-01-01

-- Add new columns to incoming_receipts table
ALTER TABLE incoming_receipts 
ADD COLUMN IF NOT EXISTS origin TEXT,
ADD COLUMN IF NOT EXISTS variety TEXT,
ADD COLUMN IF NOT EXISTS vehicle_reg TEXT,
ADD COLUMN IF NOT EXISTS appearance_result TEXT,
ADD COLUMN IF NOT EXISTS colour_result TEXT,
ADD COLUMN IF NOT EXISTS moisture_content_result TEXT,
ADD COLUMN IF NOT EXISTS aflatoxin_result TEXT,
ADD COLUMN IF NOT EXISTS rancidity_result TEXT,
ADD COLUMN IF NOT EXISTS foreign_matter_3040_result TEXT,
ADD COLUMN IF NOT EXISTS split_kernels_4050_result TEXT,
ADD COLUMN IF NOT EXISTS shrivelled_kernels_5060_result TEXT,
ADD COLUMN IF NOT EXISTS mouldy_kernels_6070_result TEXT,
ADD COLUMN IF NOT EXISTS live_insects_7080_result TEXT,
ADD COLUMN IF NOT EXISTS rotten_nuts_80100_result TEXT,
ADD COLUMN IF NOT EXISTS grade_out_percent TEXT,
ADD COLUMN IF NOT EXISTS decision TEXT CHECK (decision IN ('accept', 'reject')),
ADD COLUMN IF NOT EXISTS reviewed_by_name TEXT,
ADD COLUMN IF NOT EXISTS reviewed_by_date DATE,
ADD COLUMN IF NOT EXISTS approved_by_name TEXT,
ADD COLUMN IF NOT EXISTS approved_by_date DATE;

-- Add comments for documentation
COMMENT ON COLUMN incoming_receipts.origin IS 'Origin of the raw materials';
COMMENT ON COLUMN incoming_receipts.variety IS 'Variety of peanuts';
COMMENT ON COLUMN incoming_receipts.vehicle_reg IS 'Vehicle registration number';
COMMENT ON COLUMN incoming_receipts.appearance_result IS 'Appearance inspection result';
COMMENT ON COLUMN incoming_receipts.colour_result IS 'Colour inspection result';
COMMENT ON COLUMN incoming_receipts.moisture_content_result IS 'Moisture content inspection result';
COMMENT ON COLUMN incoming_receipts.aflatoxin_result IS 'Aflatoxin inspection result';
COMMENT ON COLUMN incoming_receipts.rancidity_result IS 'Rancidity (peroxide value) inspection result';
COMMENT ON COLUMN incoming_receipts.foreign_matter_3040_result IS 'Foreign matter result for 30/40 size count';
COMMENT ON COLUMN incoming_receipts.split_kernels_4050_result IS 'Split kernels result for 40/50 size count';
COMMENT ON COLUMN incoming_receipts.shrivelled_kernels_5060_result IS 'Shrivelled kernels result for 50/60 size count';
COMMENT ON COLUMN incoming_receipts.mouldy_kernels_6070_result IS 'Mouldy kernels result for 60/70 size count';
COMMENT ON COLUMN incoming_receipts.live_insects_7080_result IS 'Live insects result for 70/80 size count';
COMMENT ON COLUMN incoming_receipts.rotten_nuts_80100_result IS 'Rotten nuts result for 80/100 size count';
COMMENT ON COLUMN incoming_receipts.grade_out_percent IS 'Grade out percentage';
COMMENT ON COLUMN incoming_receipts.decision IS 'Final decision: accept or reject';
COMMENT ON COLUMN incoming_receipts.reviewed_by_name IS 'Name of SHEQ Manager who reviewed';
COMMENT ON COLUMN incoming_receipts.reviewed_by_date IS 'Date of review by SHEQ Manager';
COMMENT ON COLUMN incoming_receipts.approved_by_name IS 'Name of CEO/FM who approved';
COMMENT ON COLUMN incoming_receipts.approved_by_date IS 'Date of approval by CEO/FM';
