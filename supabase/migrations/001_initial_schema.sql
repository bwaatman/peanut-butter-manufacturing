-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE 1: batches
-- ============================================
CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_no TEXT UNIQUE NOT NULL,
    production_date DATE NOT NULL,
    product_name TEXT DEFAULT 'Peanut Butter',
    process_status TEXT NOT NULL DEFAULT 'received',
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add check constraint for process_status
ALTER TABLE batches 
ADD CONSTRAINT check_process_status 
CHECK (process_status IN ('received', 'sorting', 'roasting', 'finished', 'completed'));

-- Add index on batch_no for quick lookups
CREATE INDEX idx_batches_batch_no ON batches(batch_no);
CREATE INDEX idx_batches_production_date ON batches(production_date);
CREATE INDEX idx_batches_process_status ON batches(process_status);

-- ============================================
-- TABLE 2: incoming_receipts
-- ============================================
CREATE TABLE incoming_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID UNIQUE NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    receipt_date DATE,
    supplier_name TEXT,
    quantity_received_kg DECIMAL(10, 2),
    remarks TEXT,
    received_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index on batch_id
CREATE INDEX idx_incoming_receipts_batch_id ON incoming_receipts(batch_id);

-- ============================================
-- TABLE 3: sorting_efficiency_form
-- ============================================
CREATE TABLE sorting_efficiency_form (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID UNIQUE NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    form_date DATE,
    moisture_percent DECIMAL(5, 2),
    total_aflatoxin_ppb DECIMAL(10, 2),
    check_time TIME,
    
    -- Sorting measurements
    rotten_nuts_percent DECIMAL(5, 2),
    shriveled_nuts_percent DECIMAL(5, 2),
    over_roast_nuts_percent DECIMAL(5, 2),
    non_branched_nuts_percent DECIMAL(5, 2),
    
    -- Overall efficiency
    overall_sorting_efficiency DECIMAL(5, 2),
    
    -- Result
    result TEXT,
    remarks TEXT,
    analyst_name TEXT,
    analyst_signature TEXT,
    signed_date DATE,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add check constraint for result
ALTER TABLE sorting_efficiency_form 
ADD CONSTRAINT check_sorting_result 
CHECK (result IN ('pass', 'fail'));

-- Add index on batch_id
CREATE INDEX idx_sorting_efficiency_batch_id ON sorting_efficiency_form(batch_id);

-- ============================================
-- TABLE 4: roasting_temperature_form
-- ============================================
CREATE TABLE roasting_temperature_form (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    form_date DATE,
    check_time TIME,
    temperature DECIMAL(5, 2),
    within_limit BOOLEAN,
    remarks TEXT,
    analyst_name TEXT,
    analyst_signature TEXT,
    signed_date DATE,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add check constraint for temperature range (137°C to 230°C)
ALTER TABLE roasting_temperature_form 
ADD CONSTRAINT check_temperature_range 
CHECK (temperature >= 137 AND temperature <= 230);

-- Add index on batch_id (note: not unique, as multiple records allowed per batch)
CREATE INDEX idx_roasting_temperature_batch_id ON roasting_temperature_form(batch_id);
CREATE INDEX idx_roasting_temperature_form_date ON roasting_temperature_form(form_date);

-- ============================================
-- TABLE 5: finished_goods
-- ============================================
CREATE TABLE finished_goods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID UNIQUE NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    finished_date DATE,
    quantity_produced_kg DECIMAL(10, 2),
    qc_result TEXT,
    remarks TEXT,
    approved_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index on batch_id
CREATE INDEX idx_finished_goods_batch_id ON finished_goods(batch_id);

-- ============================================
-- FUNCTION: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incoming_receipts_updated_at BEFORE UPDATE ON incoming_receipts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sorting_efficiency_form_updated_at BEFORE UPDATE ON sorting_efficiency_form
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roasting_temperature_form_updated_at BEFORE UPDATE ON roasting_temperature_form
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_finished_goods_updated_at BEFORE UPDATE ON finished_goods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- USER ROLES SETUP
-- ============================================

-- Create custom roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
        CREATE ROLE admin;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'analyst') THEN
        CREATE ROLE analyst;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'production_staff') THEN
        CREATE ROLE production_staff;
    END IF;
END
$$;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE incoming_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sorting_efficiency_form ENABLE ROW LEVEL SECURITY;
ALTER TABLE roasting_temperature_form ENABLE ROW LEVEL SECURITY;
ALTER TABLE finished_goods ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR batches
-- ============================================

-- Admin: Full access
CREATE POLICY "Admin full access on batches" ON batches
    FOR ALL
    TO admin
    USING (true)
    WITH CHECK (true);

-- Analyst: Read access
CREATE POLICY "Analyst read access on batches" ON batches
    FOR SELECT
    TO analyst
    USING (true);

-- Production Staff: Read, Insert, Update
CREATE POLICY "Production staff read batches" ON batches
    FOR SELECT
    TO production_staff
    USING (true);

CREATE POLICY "Production staff insert batches" ON batches
    FOR INSERT
    TO production_staff
    WITH CHECK (true);

CREATE POLICY "Production staff update batches" ON batches
    FOR UPDATE
    TO production_staff
    USING (true);

-- Authenticated users: Read access
CREATE POLICY "Authenticated read batches" ON batches
    FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- RLS POLICIES FOR incoming_receipts
-- ============================================

-- Admin: Full access
CREATE POLICY "Admin full access on incoming_receipts" ON incoming_receipts
    FOR ALL
    TO admin
    USING (true)
    WITH CHECK (true);

-- Analyst: Read access
CREATE POLICY "Analyst read incoming_receipts" ON incoming_receipts
    FOR SELECT
    TO analyst
    USING (true);

-- Production Staff: Full access
CREATE POLICY "Production staff full access on incoming_receipts" ON incoming_receipts
    FOR ALL
    TO production_staff
    USING (true)
    WITH CHECK (true);

-- Authenticated users: Read access
CREATE POLICY "Authenticated read incoming_receipts" ON incoming_receipts
    FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- RLS POLICIES FOR sorting_efficiency_form
-- ============================================

-- Admin: Full access
CREATE POLICY "Admin full access on sorting_efficiency_form" ON sorting_efficiency_form
    FOR ALL
    TO admin
    USING (true)
    WITH CHECK (true);

-- Analyst: Full access
CREATE POLICY "Analyst full access on sorting_efficiency_form" ON sorting_efficiency_form
    FOR ALL
    TO analyst
    USING (true)
    WITH CHECK (true);

-- Production Staff: Read access
CREATE POLICY "Production staff read sorting_efficiency_form" ON sorting_efficiency_form
    FOR SELECT
    TO production_staff
    USING (true);

-- Authenticated users: Read access
CREATE POLICY "Authenticated read sorting_efficiency_form" ON sorting_efficiency_form
    FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- RLS POLICIES FOR roasting_temperature_form
-- ============================================

-- Admin: Full access
CREATE POLICY "Admin full access on roasting_temperature_form" ON roasting_temperature_form
    FOR ALL
    TO admin
    USING (true)
    WITH CHECK (true);

-- Analyst: Full access
CREATE POLICY "Analyst full access on roasting_temperature_form" ON roasting_temperature_form
    FOR ALL
    TO analyst
    USING (true)
    WITH CHECK (true);

-- Production Staff: Read access
CREATE POLICY "Production staff read roasting_temperature_form" ON roasting_temperature_form
    FOR SELECT
    TO production_staff
    USING (true);

-- Authenticated users: Read access
CREATE POLICY "Authenticated read roasting_temperature_form" ON roasting_temperature_form
    FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- RLS POLICIES FOR finished_goods
-- ============================================

-- Admin: Full access
CREATE POLICY "Admin full access on finished_goods" ON finished_goods
    FOR ALL
    TO admin
    USING (true)
    WITH CHECK (true);

-- Analyst: Read access
CREATE POLICY "Analyst read finished_goods" ON finished_goods
    FOR SELECT
    TO analyst
    USING (true);

-- Production Staff: Full access
CREATE POLICY "Production staff full access on finished_goods" ON finished_goods
    FOR ALL
    TO production_staff
    USING (true)
    WITH CHECK (true);

-- Authenticated users: Read access
CREATE POLICY "Authenticated read finished_goods" ON finished_goods
    FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- HELPER FUNCTIONS FOR BATCH STATUS
-- ============================================

-- Function to update batch status based on completed stages
CREATE OR REPLACE FUNCTION update_batch_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if incoming receipt exists
    IF EXISTS (SELECT 1 FROM incoming_receipts WHERE batch_id = NEW.batch_id) THEN
        UPDATE batches SET process_status = 'sorting' WHERE id = NEW.batch_id;
    END IF;
    
    -- Check if sorting form exists
    IF EXISTS (SELECT 1 FROM sorting_efficiency_form WHERE batch_id = NEW.batch_id) THEN
        UPDATE batches SET process_status = 'roasting' WHERE id = NEW.batch_id;
    END IF;
    
    -- Check if roasting logs exist
    IF EXISTS (SELECT 1 FROM roasting_temperature_form WHERE batch_id = NEW.batch_id) THEN
        UPDATE batches SET process_status = 'finished' WHERE id = NEW.batch_id;
    END IF;
    
    -- Check if finished goods record exists
    IF EXISTS (SELECT 1 FROM finished_goods WHERE batch_id = NEW.batch_id) THEN
        UPDATE batches SET process_status = 'completed' WHERE id = NEW.batch_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic status updates
CREATE TRIGGER update_batch_status_on_receipt
    AFTER INSERT ON incoming_receipts
    FOR EACH ROW EXECUTE FUNCTION update_batch_status();

CREATE TRIGGER update_batch_status_on_sorting
    AFTER INSERT ON sorting_efficiency_form
    FOR EACH ROW EXECUTE FUNCTION update_batch_status();

CREATE TRIGGER update_batch_status_on_roasting
    AFTER INSERT ON roasting_temperature_form
    FOR EACH ROW EXECUTE FUNCTION update_batch_status();

CREATE TRIGGER update_batch_status_on_finished
    AFTER INSERT ON finished_goods
    FOR EACH ROW EXECUTE FUNCTION update_batch_status();
