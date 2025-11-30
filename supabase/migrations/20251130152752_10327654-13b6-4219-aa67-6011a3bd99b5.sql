-- Drop the old constraint
ALTER TABLE translations 
DROP CONSTRAINT IF EXISTS translations_review_status_check;

-- Add new constraint with 'needs_translation' included
ALTER TABLE translations 
ADD CONSTRAINT translations_review_status_check 
CHECK (review_status = ANY (ARRAY[
  'pending'::text, 
  'approved'::text, 
  'needs_review'::text, 
  'rejected'::text,
  'needs_translation'::text,
  'stale'::text
]));