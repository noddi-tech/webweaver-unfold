-- Fix duplicate and similar color values for better visual distinction

-- Phase 1: Differentiate Accent from Secondary
UPDATE color_tokens 
SET value = '270 20% 95%',
    description = 'Light lavender surface - distinct from secondary'
WHERE css_var = '--accent';

UPDATE color_tokens 
SET value = '249 50% 20%',
    description = 'Dark purple-blue text - complements accent surface'
WHERE css_var = '--accent-foreground';

-- Phase 2: Fix muted-foreground for AAA contrast compliance
UPDATE color_tokens 
SET value = '0 0% 35%',
    description = 'Medium gray text - AAA contrast (7:1) on light backgrounds'
WHERE css_var = '--muted-foreground';