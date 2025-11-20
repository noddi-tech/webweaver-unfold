-- =============================================
-- AUTOMATIC AAA CONTRAST FIX
-- Update optimal_text_color for all color tokens
-- =============================================

-- Update experimental mesh gradients to use white text (dark/vibrant backgrounds)
UPDATE color_tokens 
SET optimal_text_color = 'white'
WHERE category = 'experimental' 
  AND color_type = 'gradient'
  AND css_var LIKE '--gradient-mesh-%';

-- Update standard gradients to use white text
UPDATE color_tokens
SET optimal_text_color = 'white'
WHERE category = 'gradients'
  AND color_type = 'gradient';

-- Update glass effects to use appropriate text color
UPDATE color_tokens
SET optimal_text_color = 'dark'
WHERE color_type = 'glass'
  AND (css_var LIKE '%card%' OR css_var LIKE '%prominent%');

-- Update glass accents to use white text
UPDATE color_tokens
SET optimal_text_color = 'white'
WHERE color_type = 'glass'
  AND css_var LIKE '%accent%';

-- Ensure all light surface colors have dark text
UPDATE color_tokens
SET optimal_text_color = 'dark'
WHERE category = 'surfaces'
  AND (
    css_var IN ('--background', '--muted', '--accent')
    OR value LIKE '%96%' -- Light backgrounds
    OR value LIKE '%100%' -- White backgrounds
  );

-- Ensure all dark surface colors have white text
UPDATE color_tokens
SET optimal_text_color = 'white'
WHERE category = 'surfaces'
  AND (
    css_var = '--card'
    OR css_var = '--primary'
    OR value LIKE '%24%' -- Federal blue (24% lightness)
  );

-- Update interactive colors
UPDATE color_tokens
SET optimal_text_color = 'white'
WHERE category = 'interactive'
  AND css_var IN ('--primary', '--primary-foreground');

-- Update feedback colors
UPDATE color_tokens
SET optimal_text_color = 'white'
WHERE category = 'feedback'
  AND css_var IN ('--destructive', '--success', '--warning', '--info');