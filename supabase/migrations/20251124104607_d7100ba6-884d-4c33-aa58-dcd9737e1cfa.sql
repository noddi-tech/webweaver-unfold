-- Fix glass effects and prepare for proper rendering
-- Step 1: Fix glass effect css_var prefixes (add -- if missing)
UPDATE color_tokens 
SET css_var = '--' || css_var 
WHERE category = 'glass' 
AND css_var NOT LIKE '--%';

-- Step 2: Fix glass effect values (remove "background: " prefix and fix format)
UPDATE color_tokens 
SET value = CASE
  WHEN label = 'Glass Solid' THEN '249 67% 24%'
  WHEN label = 'Glass Card' THEN '249 67% 24%'
  WHEN label = 'Glass Prominent' THEN '249 67% 24%'
  ELSE REPLACE(REPLACE(value, 'background: ', ''), 'rgba', 'hsl')
END
WHERE category = 'glass';

-- Step 3: Update glass preview classes to proper utility classes
UPDATE color_tokens 
SET preview_class = CASE 
  WHEN label = 'Glass Light' THEN 'bg-white/10 backdrop-blur-md border border-white/20'
  WHEN label = 'Glass Dark' THEN 'bg-black/20 backdrop-blur-md border border-white/10'
  WHEN label = 'Glass Primary' THEN 'bg-primary/10 backdrop-blur-md border border-primary/20'
  WHEN label = 'Glass Solid' THEN 'glass-solid'
  WHEN label = 'Glass Card' THEN 'glass-card'
  WHEN label = 'Glass Prominent' THEN 'glass-prominent'
END
WHERE category = 'glass';