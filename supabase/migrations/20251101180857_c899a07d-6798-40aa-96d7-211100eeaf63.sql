-- Add slug column to solutions table
ALTER TABLE solutions ADD COLUMN IF NOT EXISTS slug text;

-- Create a function to generate URL-friendly slugs
CREATE OR REPLACE FUNCTION generate_slug(text_input text) 
RETURNS text AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(text_input, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Generate slugs for existing solutions based on their title
UPDATE solutions 
SET slug = generate_slug(title)
WHERE slug IS NULL;

-- Make slug required for new records
ALTER TABLE solutions ALTER COLUMN slug SET NOT NULL;

-- Add unique constraint to ensure slug uniqueness
ALTER TABLE solutions ADD CONSTRAINT solutions_slug_unique UNIQUE (slug);

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS solutions_slug_idx ON solutions(slug);

-- Create a trigger to auto-generate slug from title if not provided
CREATE OR REPLACE FUNCTION auto_generate_solution_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER solution_slug_trigger
BEFORE INSERT OR UPDATE ON solutions
FOR EACH ROW
EXECUTE FUNCTION auto_generate_solution_slug();