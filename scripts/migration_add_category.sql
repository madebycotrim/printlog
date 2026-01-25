-- Migration: Add missing columns and remove strict org_id dependency
-- Run this in your Database Manager or D1 Console

-- 1. Add category column if missing
ALTER TABLE supplies ADD COLUMN category TEXT DEFAULT 'geral';

-- 2. Add description column if missing
ALTER TABLE supplies ADD COLUMN description TEXT;

-- 3. (Optional) If you want to clean up existing data
-- UPDATE supplies SET category = 'geral' WHERE category IS NULL;
