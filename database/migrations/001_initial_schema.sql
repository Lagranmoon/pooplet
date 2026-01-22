-- Migration: 001_initial_schema
-- Description: Create initial database schema for bowel movement tracker
-- Created: 2024-01-01

-- =============================================================================
-- Create bowel_movements table
-- =============================================================================

CREATE TABLE bowel_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    occurred_at TIMESTAMPTZ NOT NULL,
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 7),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- Add constraints
-- =============================================================================

-- Ensure occurred_at is not in the future
ALTER TABLE bowel_movements 
ADD CONSTRAINT check_occurred_at_not_future 
CHECK (occurred_at <= NOW());

-- Limit notes length
ALTER TABLE bowel_movements 
ADD CONSTRAINT check_notes_length 
CHECK (notes IS NULL OR LENGTH(notes) <= 500);

-- Ensure quality_rating is not null
ALTER TABLE bowel_movements 
ADD CONSTRAINT check_quality_rating_not_null 
CHECK (quality_rating IS NOT NULL);

-- Ensure user_id is not null
ALTER TABLE bowel_movements 
ADD CONSTRAINT check_user_id_not_null 
CHECK (user_id IS NOT NULL);

-- =============================================================================
-- Create indexes
-- =============================================================================

CREATE INDEX idx_bowel_movements_user_id ON bowel_movements(user_id);
CREATE INDEX idx_bowel_movements_occurred_at ON bowel_movements(occurred_at);
CREATE INDEX idx_bowel_movements_user_occurred ON bowel_movements(user_id, occurred_at);
CREATE INDEX idx_bowel_movements_user_date_quality ON bowel_movements(user_id, DATE(occurred_at), quality_rating);
CREATE INDEX idx_bowel_movements_user_created ON bowel_movements(user_id, created_at);

-- =============================================================================
-- Create trigger function for updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_bowel_movements_updated_at 
    BEFORE UPDATE ON bowel_movements 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Enable RLS and create policies
-- =============================================================================

ALTER TABLE bowel_movements ENABLE ROW LEVEL SECURITY;

-- Users can view own records
CREATE POLICY "Users can view own records" ON bowel_movements
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Users can create own records
CREATE POLICY "Users can create own records" ON bowel_movements
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can update own records
CREATE POLICY "Users can update own records" ON bowel_movements
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete own records
CREATE POLICY "Users can delete own records" ON bowel_movements
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- =============================================================================
-- Create statistics view
-- =============================================================================

CREATE VIEW user_bowel_movement_stats AS
SELECT 
    user_id,
    DATE(occurred_at) as date,
    COUNT(*) as daily_count,
    AVG(quality_rating) as avg_quality,
    MIN(quality_rating) as min_quality,
    MAX(quality_rating) as max_quality
FROM bowel_movements
GROUP BY user_id, DATE(occurred_at);

-- Enable RLS for view
ALTER VIEW user_bowel_movement_stats SET (security_invoker = true);