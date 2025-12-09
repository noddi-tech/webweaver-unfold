-- Fix glass tokens to use LIGHT background values (not Federal Blue)
UPDATE color_tokens 
SET value = '0 0% 98%', optimal_text_color = 'dark'
WHERE css_var IN ('--glass-card', '--glass-solid', '--glass-prominent');

-- Clean up duplicate background_styles entries (keep only -background suffix versions)
DELETE FROM background_styles 
WHERE element_id ~ '^functions-card-[0-9]$';

-- Standardize text_color_class to 'white' for glass cards (white text on light glass = wrong, should be dark)
UPDATE background_styles 
SET text_color_class = 'foreground'
WHERE element_id LIKE 'functions-card-%-background';