
-- 1. Add booking-specific columns to employees
ALTER TABLE employees ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Oslo';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS google_calendar_connected BOOLEAN DEFAULT false;

-- 2. Generate slugs
UPDATE employees SET slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g')) WHERE slug IS NULL;

-- 3. Drop old FK constraints
ALTER TABLE availability_rules DROP CONSTRAINT IF EXISTS availability_rules_team_member_id_fkey;
ALTER TABLE event_type_members DROP CONSTRAINT IF EXISTS event_type_members_team_member_id_fkey;
ALTER TABLE booking_members DROP CONSTRAINT IF EXISTS booking_members_team_member_id_fkey;
ALTER TABLE google_oauth_tokens DROP CONSTRAINT IF EXISTS google_oauth_tokens_team_member_id_fkey;

-- 4. Re-point Joachim
UPDATE availability_rules SET team_member_id = 'c2ca1ad1-7f2a-499b-bab7-1783da272a93' WHERE team_member_id = 'a1b2c3d4-0001-4000-8000-000000000001';
UPDATE event_type_members SET team_member_id = 'c2ca1ad1-7f2a-499b-bab7-1783da272a93' WHERE team_member_id = 'a1b2c3d4-0001-4000-8000-000000000001';
UPDATE booking_members SET team_member_id = 'c2ca1ad1-7f2a-499b-bab7-1783da272a93' WHERE team_member_id = 'a1b2c3d4-0001-4000-8000-000000000001';
UPDATE google_oauth_tokens SET team_member_id = 'c2ca1ad1-7f2a-499b-bab7-1783da272a93' WHERE team_member_id = 'a1b2c3d4-0001-4000-8000-000000000001';

-- 5. Re-point Tom Arne
UPDATE availability_rules SET team_member_id = 'a1322901-af08-43af-9ce9-f500ba564f13' WHERE team_member_id = 'a1b2c3d4-0002-4000-8000-000000000002';
UPDATE event_type_members SET team_member_id = 'a1322901-af08-43af-9ce9-f500ba564f13' WHERE team_member_id = 'a1b2c3d4-0002-4000-8000-000000000002';
UPDATE booking_members SET team_member_id = 'a1322901-af08-43af-9ce9-f500ba564f13' WHERE team_member_id = 'a1b2c3d4-0002-4000-8000-000000000002';
UPDATE google_oauth_tokens SET team_member_id = 'a1322901-af08-43af-9ce9-f500ba564f13' WHERE team_member_id = 'a1b2c3d4-0002-4000-8000-000000000002';

-- 6. Copy calendar connected status
UPDATE employees SET google_calendar_connected = true WHERE id = 'c2ca1ad1-7f2a-499b-bab7-1783da272a93' AND EXISTS (SELECT 1 FROM team_members WHERE id = 'a1b2c3d4-0001-4000-8000-000000000001' AND google_calendar_connected = true);
UPDATE employees SET google_calendar_connected = true WHERE id = 'a1322901-af08-43af-9ce9-f500ba564f13' AND EXISTS (SELECT 1 FROM team_members WHERE id = 'a1b2c3d4-0002-4000-8000-000000000002' AND google_calendar_connected = true);

-- 7. Add new FK constraints to employees
ALTER TABLE availability_rules ADD CONSTRAINT availability_rules_team_member_id_fkey FOREIGN KEY (team_member_id) REFERENCES employees(id) ON DELETE CASCADE;
ALTER TABLE event_type_members ADD CONSTRAINT event_type_members_team_member_id_fkey FOREIGN KEY (team_member_id) REFERENCES employees(id) ON DELETE CASCADE;
ALTER TABLE booking_members ADD CONSTRAINT booking_members_team_member_id_fkey FOREIGN KEY (team_member_id) REFERENCES employees(id) ON DELETE CASCADE;
ALTER TABLE google_oauth_tokens ADD CONSTRAINT google_oauth_tokens_team_member_id_fkey FOREIGN KEY (team_member_id) REFERENCES employees(id) ON DELETE CASCADE;

-- 8. Drop team_members table
DROP TABLE IF EXISTS team_members CASCADE;
