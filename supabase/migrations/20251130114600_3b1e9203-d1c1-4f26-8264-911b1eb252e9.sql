-- Add is_intentionally_empty flag to translations table
ALTER TABLE translations ADD COLUMN IF NOT EXISTS is_intentionally_empty BOOLEAN DEFAULT false;

-- Add comment explaining the column
COMMENT ON COLUMN translations.is_intentionally_empty IS 'Marks translations that are intentionally left empty (e.g., spacing elements, optional fields). These are excluded from health checks and warnings.';