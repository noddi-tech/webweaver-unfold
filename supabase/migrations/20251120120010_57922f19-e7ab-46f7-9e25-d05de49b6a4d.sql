-- First, drop the existing check constraint
ALTER TABLE color_tokens 
DROP CONSTRAINT IF EXISTS color_tokens_category_check;

-- Add new check constraint that includes all existing categories plus 'experimental'
ALTER TABLE color_tokens 
ADD CONSTRAINT color_tokens_category_check 
CHECK (category IN ('surfaces', 'interactive', 'feedback', 'gradients', 'experimental', 'glass', 'text'));

-- Now separate experimental mesh gradients into their own category
UPDATE color_tokens 
SET category = 'experimental' 
WHERE css_var LIKE '--gradient-mesh-%' 
  AND color_type = 'gradient';