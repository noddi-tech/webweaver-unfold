-- Seed default homepage metrics into public.usps if they don't already exist
WITH new_metrics AS (
  SELECT 1 AS sort_order, 'Active Providers'::text AS title, '500'::text AS metric_value, 'Maintenance providers using our platform'::text AS metric_description, 'Users'::text AS icon_name, 'card'::text AS metric_style, 'center'::text AS metric_align, 'xl'::text AS metric_value_size, 'gradient'::text AS metric_emphasis, '+'::text AS metric_suffix, true AS metric_show_icon
  UNION ALL SELECT 2, 'Uptime','98','Reliable platform performance','Activity','card','center','xl','gradient','%',true
  UNION ALL SELECT 3, 'Cost Reduction','45','Average operational savings','TrendingDown','card','center','xl','gradient','%',true
  UNION ALL SELECT 4, 'Support','24/7','Always here when you need us','Clock','card','center','xl','gradient','',true
)
INSERT INTO public.usps (
  sort_order, title, metric_value, metric_description, icon_name,
  metric_style, metric_align, metric_value_size, metric_emphasis,
  metric_suffix, metric_show_icon, location, format, active
)
SELECT 
  sort_order, title, metric_value, metric_description, icon_name,
  metric_style, metric_align, metric_value_size, metric_emphasis,
  metric_suffix, metric_show_icon, 'metrics', 'metric', true
FROM new_metrics nm
WHERE NOT EXISTS (
  SELECT 1 FROM public.usps u
  WHERE u.title = nm.title AND u.location = 'metrics' AND u.format = 'metric'
);
