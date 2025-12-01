-- Add button_icon column to text_content table
ALTER TABLE text_content 
ADD COLUMN button_icon TEXT DEFAULT 'ArrowRight';

-- Add comment to explain the column
COMMENT ON COLUMN text_content.button_icon IS 'Icon name from Lucide icons library to display in button (optional)';

-- Update existing scrolling-features-cta entry with default icon
UPDATE text_content 
SET button_icon = 'ArrowRight' 
WHERE element_id = 'scrolling-features-cta';