-- Add Architecture page English translation keys
INSERT INTO public.translations (translation_key, language_code, translated_text, approved, page_location) VALUES
-- Architecture Hero
('architecture.hero.title', 'en', 'One data model. One brain. Real-time everything.', true, 'architecture'),
('architecture.hero.subtitle', 'en', 'Noddi runs backend and frontend in perfect sync — because they''re the same thing.', true, 'architecture'),
('architecture.hero.cta', 'en', 'Book a technical demo', true, 'architecture'),

-- Architecture Principles
('architecture.principles.title', 'en', 'Core Principles', true, 'architecture'),
('architecture.principles.subtitle', 'en', 'How Noddi is built to scale, secure, and perform.', true, 'architecture'),
('architecture.principles.unified.title', 'en', 'Everything speaks the same language.', true, 'architecture'),
('architecture.principles.unified.description', 'en', 'One schema for customers, bookings, and tires.', true, 'architecture'),
('architecture.principles.reactive.title', 'en', 'The system reacts before you can.', true, 'architecture'),
('architecture.principles.reactive.description', 'en', 'Real-time automation on every action.', true, 'architecture'),
('architecture.principles.scalable.title', 'en', 'Built for cities, not just garages.', true, 'architecture'),
('architecture.principles.scalable.description', 'en', 'Regional deployments, multi-tenant by default.', true, 'architecture'),
('architecture.principles.secure.title', 'en', 'Privacy isn''t a feature — it''s architecture.', true, 'architecture'),
('architecture.principles.secure.description', 'en', 'Encryption, roles, audit trails.', true, 'architecture'),
('architecture.principles.open.title', 'en', 'Open by default.', true, 'architecture'),
('architecture.principles.open.description', 'en', 'REST + GraphQL endpoints for anything external.', true, 'architecture'),
('architecture.principles.fast.title', 'en', 'Fast. Always.', true, 'architecture'),
('architecture.principles.fast.description', 'en', '99.9% uptime and sub-second load speeds.', true, 'architecture'),

-- Architecture Integrations
('architecture.integrations.title', 'en', 'Connected where it counts.', true, 'architecture'),
('architecture.integrations.subtitle', 'en', 'Tire databases, scanners, payments, CRMs — all in one flow.', true, 'architecture'),
('architecture.integrations.tire_databases.name', 'en', 'Tire Databases', true, 'architecture'),
('architecture.integrations.tire_databases.description', 'en', 'Real-time inventory', true, 'architecture'),
('architecture.integrations.laser_scanners.name', 'en', 'Laser Scanners', true, 'architecture'),
('architecture.integrations.laser_scanners.description', 'en', 'Instant tire depth', true, 'architecture'),
('architecture.integrations.payment_gateways.name', 'en', 'Payment Gateways', true, 'architecture'),
('architecture.integrations.payment_gateways.description', 'en', 'Secure checkout', true, 'architecture'),
('architecture.integrations.crm_erp.name', 'en', 'CRM / ERP Systems', true, 'architecture'),
('architecture.integrations.crm_erp.description', 'en', 'Data flow', true, 'architecture'),
('architecture.integrations.footer', 'en', 'Integration optional. Everything works out-of-the-box.', true, 'architecture'),

-- Architecture CTA
('architecture.cta.title', 'en', 'See the logic in motion.', true, 'architecture'),
('architecture.cta.button_demo', 'en', 'Book a technical demo', true, 'architecture'),
('architecture.cta.button_docs', 'en', 'Request docs', true, 'architecture')

ON CONFLICT (translation_key, language_code) DO NOTHING;