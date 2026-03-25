
-- Update "Before" card to muted styling
UPDATE background_styles 
SET background_class = 'bg-muted/50', text_color_class = 'muted-foreground'
WHERE element_id = 'why-noddi-before-card-background';

UPDATE background_styles 
SET background_class = 'bg-muted/50', text_color_class = 'muted-foreground'
WHERE element_id = 'why-noddi-before-card';

-- Update "After" card to prominent styling
UPDATE background_styles 
SET background_class = 'bg-card', text_color_class = 'foreground'
WHERE element_id = 'why-noddi-after-card-background';

UPDATE background_styles 
SET background_class = 'bg-card', text_color_class = 'foreground'
WHERE element_id = 'why-noddi-after-card';
