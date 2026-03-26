ALTER TABLE event_types ADD COLUMN min_duration_minutes integer;
ALTER TABLE event_types ADD COLUMN max_duration_minutes integer;
ALTER TABLE event_types ADD COLUMN duration_step_minutes integer DEFAULT 15;