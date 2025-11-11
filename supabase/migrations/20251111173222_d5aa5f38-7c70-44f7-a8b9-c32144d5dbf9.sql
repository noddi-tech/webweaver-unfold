-- Make section field nullable for library-first approach
ALTER TABLE images 
ALTER COLUMN section DROP NOT NULL;

-- Update existing images with NULL section to "Library" for clarity
UPDATE images 
SET section = 'Library' 
WHERE section IS NULL;

-- Add comment explaining the library pattern
COMMENT ON COLUMN images.section IS 'Section assignment for images. NULL or "Library" means unassigned images in the library.';