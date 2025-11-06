-- Add element_id column to text_content table for simplified CMS editing
ALTER TABLE text_content 
ADD COLUMN IF NOT EXISTS element_id TEXT;

-- Create index for performance on element_id lookups
CREATE INDEX IF NOT EXISTS idx_text_content_element_id 
ON text_content(element_id);

-- Populate element_id from existing element_type for card-specific elements
UPDATE text_content 
SET element_id = element_type 
WHERE element_id IS NULL 
AND element_type IS NOT NULL
AND element_type LIKE '%card%';

-- Add unique constraint to prevent duplicate element_ids
CREATE UNIQUE INDEX IF NOT EXISTS idx_text_content_element_id_unique 
ON text_content(element_id) 
WHERE element_id IS NOT NULL;

-- Add helpful comment
COMMENT ON COLUMN text_content.element_id IS 
'Simplified identifier for CMS editing. Replaces compound key of page_location+section+element_type for direct element targeting.';