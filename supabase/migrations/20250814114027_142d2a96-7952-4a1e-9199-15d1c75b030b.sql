-- Rename headings table to text_content for better clarity
ALTER TABLE public.headings RENAME TO text_content;

-- Add a content_type field to better categorize different types of text
ALTER TABLE public.text_content 
ADD COLUMN content_type VARCHAR(50) DEFAULT 'heading';

-- Update existing records to have appropriate content_types
UPDATE public.text_content 
SET content_type = CASE 
  WHEN element_type IN ('h1', 'h2', 'h3', 'h4', 'h5', 'h6') THEN 'heading'
  WHEN element_type IN ('cta', 'button') THEN 'button'
  WHEN element_type LIKE '%paragraph%' OR element_type LIKE '%body%' OR element_type = 'p' THEN 'paragraph'
  WHEN element_type LIKE '%label%' OR element_type LIKE '%caption%' THEN 'label'
  ELSE 'text'
END;