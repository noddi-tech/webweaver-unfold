-- =====================================================
-- Squash baseline migration
-- =====================================================
-- Captures full schema + operational state of remote DB
-- (project ouhfgazomdmirdazvjys) as of 2026-04-28.
--
-- This squash consolidates 207 local-only migration files
-- (2025-08-07 through 2026-03-27) plus 209 Lovable-applied
-- remote migrations into a single source-of-truth baseline.
-- The original local files are removed in this same commit;
-- their content is preserved in git history.
--
-- Generated from: pg_dump --schema=public against remote pooler
-- Augmented with: pgcrypto extension declaration + pg_cron job
-- Validated: 77 tables, 19 functions, 71 triggers, 171 policies,
--            6 views, 1 user-declared type (app_role), 312 grants
-- =====================================================

BEGIN;

-- ---------------------------------------------------
-- Required extensions (auto-installed on Supabase but
-- declared explicitly so this migration is bootable on
-- any Postgres-compatible target):
-- ---------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ---------------------------------------------------
-- Schema (from pg_dump --schema=public, 2026-04-28)
-- ---------------------------------------------------




SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."app_role" AS ENUM (
    'admin',
    'editor',
    'viewer'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_generate_solution_slug"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_generate_solution_slug"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_translation_key_conflict"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $_$
DECLARE
  parent_key text;
  child_pattern text;
  conflict_count int;
BEGIN
  -- Extract potential parent key (remove last segment if ends with a word)
  parent_key := regexp_replace(NEW.translation_key, '\.[^.]+$', '');
  child_pattern := NEW.translation_key || '.%';
  
  -- Check if inserting a parent key when children exist
  IF NEW.translation_key NOT LIKE '%.%.%' THEN
    SELECT COUNT(*) INTO conflict_count
    FROM translations
    WHERE language_code = NEW.language_code
    AND translation_key LIKE child_pattern
    AND translation_key != NEW.translation_key;
    
    IF conflict_count > 0 THEN
      RAISE EXCEPTION 'Cannot insert parent key "%" because child keys exist (e.g., "%.label"). Use either parent OR children, not both.', 
        NEW.translation_key, NEW.translation_key;
    END IF;
  END IF;
  
  -- Check if inserting a child key when parent exists
  IF parent_key != '' AND parent_key != NEW.translation_key THEN
    SELECT COUNT(*) INTO conflict_count
    FROM translations
    WHERE language_code = NEW.language_code
    AND translation_key = parent_key;
    
    IF conflict_count > 0 THEN
      RAISE EXCEPTION 'Cannot insert child key "%" because parent key "%" already exists. Use either parent OR children, not both.', 
        NEW.translation_key, parent_key;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$_$;


ALTER FUNCTION "public"."check_translation_key_conflict"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."flag_stale_translations"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Only run when English is updated and text actually changed
  IF NEW.language_code = 'en' AND (OLD.translated_text IS DISTINCT FROM NEW.translated_text) THEN
    -- Compute new hash of English text
    NEW.source_hash := MD5(NEW.translated_text);
    NEW.source_updated_at := NOW();
    NEW.is_stale := false;
    
    -- Mark all other language translations for this key as stale
    UPDATE translations 
    SET is_stale = true,
        review_status = 'stale'
    WHERE translation_key = NEW.translation_key 
    AND language_code != 'en';
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."flag_stale_translations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_slug"("text_input" "text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."generate_slug"("text_input" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role"("check_user_id" "uuid") RETURNS "public"."app_role"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT role FROM user_roles WHERE user_id = check_user_id LIMIT 1;
$$;


ALTER FUNCTION "public"."get_user_role"("check_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;


ALTER FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_empty_approval"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    IF NEW.approved = true AND (NEW.translated_text IS NULL OR NEW.translated_text = '') THEN
        -- Auto-reject approval of empty translations instead of failing
        NEW.approved := false;
        RAISE WARNING 'Cannot approve empty translation: %. Setting approved to false.', NEW.translation_key;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."prevent_empty_approval"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_unevaluated_approval"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- Allow approving if quality_score exists (has been evaluated)
    -- OR if it's English (source language, doesn't need evaluation)
    IF NEW.approved = true 
       AND NEW.quality_score IS NULL 
       AND NEW.language_code != 'en' THEN
        NEW.approved := false;
        RAISE WARNING 'Cannot approve unevaluated translation: %. Setting approved to false.', NEW.translation_key;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."prevent_unevaluated_approval"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_language_translation_stats"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY language_translation_stats;
END;
$$;


ALTER FUNCTION "public"."refresh_language_translation_stats"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."refresh_language_translation_stats"() IS 'Refreshes the language_translation_stats materialized view. Should be called after bulk translation updates.';



CREATE OR REPLACE FUNCTION "public"."sync_blog_post_tags"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  tag_name TEXT;
  old_tag TEXT;
BEGIN
  -- Decrease count for removed tags
  IF TG_OP = 'UPDATE' AND OLD.tags IS NOT NULL THEN
    FOR old_tag IN SELECT jsonb_array_elements_text(OLD.tags::jsonb) LOOP
      -- Check if tag was removed
      IF NEW.tags IS NULL OR NOT (NEW.tags::jsonb ? old_tag) THEN
        UPDATE blog_tags SET post_count = GREATEST(0, post_count - 1) WHERE name = old_tag;
      END IF;
    END LOOP;
  END IF;
  
  -- Insert or increment new tags
  IF NEW.tags IS NOT NULL THEN
    FOR tag_name IN SELECT jsonb_array_elements_text(NEW.tags::jsonb) LOOP
      -- Check if this is a new tag for this post
      IF TG_OP = 'INSERT' OR OLD.tags IS NULL OR NOT (OLD.tags::jsonb ? tag_name) THEN
        INSERT INTO blog_tags (name, slug, post_count)
        VALUES (
          tag_name, 
          lower(regexp_replace(tag_name, '[^a-zA-Z0-9]+', '-', 'g')), 
          1
        )
        ON CONFLICT (name) DO UPDATE SET post_count = blog_tags.post_count + 1;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_blog_post_tags"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_evaluation_progress"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  lang_code text;
  total_evaluated integer;
  total_translations integer;
  current_status text;
  last_update_time timestamptz;
  hours_since_update numeric;
BEGIN
  lang_code := COALESCE(NEW.language_code, OLD.language_code);
  
  -- Skip English (source language)
  IF lang_code = 'en' THEN
    RETURN NEW;
  END IF;
  
  -- Get current status and last update time
  SELECT status, updated_at INTO current_status, last_update_time
  FROM evaluation_progress
  WHERE language_code = lang_code;
  
  -- Calculate hours since last update
  IF last_update_time IS NOT NULL THEN
    hours_since_update := EXTRACT(EPOCH FROM (now() - last_update_time)) / 3600;
  ELSE
    hours_since_update := 0;
  END IF;
  
  -- Count evaluated translations (those with quality_score)
  SELECT COUNT(*) INTO total_evaluated
  FROM translations 
  WHERE language_code = lang_code 
  AND quality_score IS NOT NULL;
  
  -- Get total translations from English
  SELECT COUNT(*) INTO total_translations
  FROM translations
  WHERE language_code = 'en';
  
  -- ✅ SELF-HEALING LOGIC: Auto-reset stuck evaluations
  -- If status is 'in_progress' and hasn't been updated in >1 hour, reset to 'idle'
  IF current_status = 'in_progress' AND hours_since_update > 1 THEN
    current_status := 'idle';
    RAISE NOTICE 'Auto-reset stuck evaluation for %: stuck for % hours', lang_code, hours_since_update;
  END IF;
  
  -- Upsert with intelligent status management
  INSERT INTO evaluation_progress (
    language_code, 
    total_keys, 
    evaluated_keys, 
    status,
    updated_at
  )
  VALUES (
    lang_code,
    total_translations,
    total_evaluated,
    CASE 
      -- Mark as completed if all keys evaluated
      WHEN total_evaluated >= total_translations THEN 'completed'
      -- Otherwise preserve current status (with auto-reset applied above)
      ELSE COALESCE(current_status, 'idle')
    END,
    now()
  )
  ON CONFLICT (language_code)
  DO UPDATE SET
    total_keys = EXCLUDED.total_keys,
    evaluated_keys = EXCLUDED.evaluated_keys,
    status = CASE 
      -- Mark as completed if all keys evaluated
      WHEN EXCLUDED.evaluated_keys >= EXCLUDED.total_keys THEN 'completed'
      -- Auto-reset if stuck for >1 hour
      WHEN evaluation_progress.status = 'in_progress' 
           AND evaluation_progress.updated_at < now() - INTERVAL '1 hour' THEN 'idle'
      -- Otherwise preserve current status
      ELSE evaluation_progress.status
    END,
    completed_at = CASE
      WHEN EXCLUDED.evaluated_keys >= EXCLUDED.total_keys THEN now()
      ELSE evaluation_progress.completed_at
    END,
    updated_at = now();
    
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_evaluation_progress"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_language_visibility"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Auto-hide languages with < 95% approval rate (except English)
  UPDATE languages
  SET show_in_switcher = false
  WHERE code != 'en' 
  AND code IN (
    SELECT language_code 
    FROM translations 
    GROUP BY language_code 
    HAVING 
      COUNT(*) > 0 AND
      (COUNT(CASE WHEN approved = true THEN 1 END)::float / COUNT(*)) < 0.95
  );
  
  -- Auto-show languages with >= 95% approval rate
  UPDATE languages
  SET show_in_switcher = true
  WHERE code IN (
    SELECT language_code 
    FROM translations 
    GROUP BY language_code 
    HAVING 
      COUNT(*) > 0 AND
      (COUNT(CASE WHEN approved = true THEN 1 END)::float / COUNT(*)) >= 0.95
  );
  
  -- Always show English
  UPDATE languages SET show_in_switcher = true WHERE code = 'en';
END;
$$;


ALTER FUNCTION "public"."sync_language_visibility"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_new_translation_to_languages"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Only when English is inserted (not updated) AND the text is not empty
  IF NEW.language_code = 'en' AND TG_OP = 'INSERT' AND TRIM(NEW.translated_text) != '' THEN
    -- Insert empty placeholders for all other enabled languages
    INSERT INTO translations (translation_key, language_code, translated_text, is_stale, review_status, approved, context, page_location)
    SELECT 
      NEW.translation_key,
      l.code,
      '', -- Empty string, not the key name!
      true,
      'needs_translation',
      false,
      NEW.context,
      NEW.page_location
    FROM languages l
    WHERE l.enabled = true AND l.code != 'en'
    ON CONFLICT (translation_key, language_code) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_new_translation_to_languages"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_translation_styling"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Only trigger when English styling is updated
  IF NEW.language_code = 'en' AND (
    OLD.color_token IS DISTINCT FROM NEW.color_token OR
    OLD.font_size IS DISTINCT FROM NEW.font_size OR
    OLD.font_size_mobile IS DISTINCT FROM NEW.font_size_mobile OR
    OLD.font_size_tablet IS DISTINCT FROM NEW.font_size_tablet OR
    OLD.font_size_desktop IS DISTINCT FROM NEW.font_size_desktop OR
    OLD.font_weight IS DISTINCT FROM NEW.font_weight OR
    OLD.is_italic IS DISTINCT FROM NEW.is_italic OR
    OLD.is_underline IS DISTINCT FROM NEW.is_underline
  ) THEN
    -- Update all non-English translations with the same key
    UPDATE translations
    SET 
      color_token = NEW.color_token,
      font_size = NEW.font_size,
      font_size_mobile = NEW.font_size_mobile,
      font_size_tablet = NEW.font_size_tablet,
      font_size_desktop = NEW.font_size_desktop,
      font_weight = NEW.font_weight,
      is_italic = NEW.is_italic,
      is_underline = NEW.is_underline,
      updated_at = now()
    WHERE translation_key = NEW.translation_key
      AND language_code != 'en';
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_translation_styling"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_sync_language_visibility"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  PERFORM sync_language_visibility();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_sync_language_visibility"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_blog_category_post_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Update old category count (if changed or deleted)
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.category_id IS DISTINCT FROM NEW.category_id) THEN
    IF OLD.category_id IS NOT NULL THEN
      UPDATE blog_categories SET post_count = (
        SELECT COUNT(*) FROM blog_posts 
        WHERE category_id = OLD.category_id AND status = 'published'
      ) WHERE id = OLD.category_id;
    END IF;
  END IF;
  
  -- Update new/current category count (for INSERT and UPDATE)
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    IF NEW.category_id IS NOT NULL THEN
      UPDATE blog_categories SET post_count = (
        SELECT COUNT(*) FROM blog_posts 
        WHERE category_id = NEW.category_id AND status = 'published'
      ) WHERE id = NEW.category_id;
    END IF;
    RETURN NEW;
  END IF;
  
  RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."update_blog_category_post_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_evaluation_progress_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_evaluation_progress_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."application_activity_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "application_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "old_value" "text",
    "new_value" "text",
    "actor_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."application_activity_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."application_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "application_id" "uuid" NOT NULL,
    "sender_type" "text" NOT NULL,
    "sender_name" "text" NOT NULL,
    "sender_email" "text" NOT NULL,
    "subject" "text",
    "body" "text" NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "application_messages_sender_type_check" CHECK (("sender_type" = ANY (ARRAY['admin'::"text", 'candidate'::"text"])))
);


ALTER TABLE "public"."application_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."availability_rules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_member_id" "uuid" NOT NULL,
    "day_of_week" integer NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL
);


ALTER TABLE "public"."availability_rules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."background_styles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "element_id" "text" NOT NULL,
    "background_class" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "text_color_class" "text",
    "shadow_class" "text" DEFAULT 'shadow-none'::"text"
);


ALTER TABLE "public"."background_styles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."background_styles"."text_color_class" IS 'CSS class for text color (e.g., text-white, text-foreground) - ensures proper contrast with background_class';



CREATE TABLE IF NOT EXISTS "public"."blog_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "color" "text" DEFAULT '#6366f1'::"text",
    "icon" "text",
    "sort_order" integer DEFAULT 0,
    "active" boolean DEFAULT true,
    "post_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."blog_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blog_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "excerpt" "text",
    "content" "text",
    "featured_image_url" "text",
    "author_name" "text",
    "author_avatar_url" "text",
    "author_title" "text",
    "category" "text",
    "tags" "jsonb" DEFAULT '[]'::"jsonb",
    "reading_time_minutes" integer DEFAULT 5,
    "published_at" timestamp with time zone,
    "active" boolean DEFAULT false NOT NULL,
    "featured" boolean DEFAULT false NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "author_employee_id" "uuid",
    "meta_title" "text",
    "meta_description" "text",
    "og_image_url" "text",
    "og_title" "text",
    "og_description" "text",
    "canonical_url" "text",
    "status" "text" DEFAULT 'draft'::"text",
    "category_id" "uuid",
    CONSTRAINT "blog_posts_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'scheduled'::"text", 'published'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."blog_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blog_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "post_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."blog_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."booking_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "team_member_id" "uuid" NOT NULL
);


ALTER TABLE "public"."booking_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bookings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_type_id" "uuid",
    "guest_name" "text" NOT NULL,
    "guest_email" "text" NOT NULL,
    "guest_company" "text",
    "guest_message" "text",
    "guest_timezone" "text" NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "status" "text" DEFAULT 'confirmed'::"text",
    "google_event_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "cancelled_at" timestamp with time zone,
    "google_calendar_event_id" "text",
    "meet_link" "text",
    "cancel_token" "text"
);


ALTER TABLE "public"."bookings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."brand_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "logo_text" "text",
    "logo_variant" "text" DEFAULT 'text'::"text" NOT NULL,
    "gradient_token" "text" DEFAULT 'gradient-primary'::"text" NOT NULL,
    "text_token" "text" DEFAULT 'foreground'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "logo_image_url" "text",
    "logo_image_height" integer DEFAULT 32 NOT NULL,
    "logo_icon_name" "text",
    "logo_icon_position" "text" DEFAULT 'top-right'::"text" NOT NULL,
    "logo_icon_size" "text" DEFAULT 'default'::"text" NOT NULL
);


ALTER TABLE "public"."brand_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."business_hours" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "day_name" "text" NOT NULL,
    "open_time" "text",
    "close_time" "text",
    "closed" boolean DEFAULT false NOT NULL,
    "sort_order" integer DEFAULT 0
);


ALTER TABLE "public"."business_hours" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."candidate_evaluations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "application_id" "uuid" NOT NULL,
    "evaluator_id" "uuid",
    "evaluator_name" "text" NOT NULL,
    "overall_recommendation" "text",
    "notes" "text",
    "strengths" "text",
    "concerns" "text",
    "submitted_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "candidate_evaluations_overall_recommendation_check" CHECK (("overall_recommendation" = ANY (ARRAY['strong_hire'::"text", 'hire'::"text", 'maybe'::"text", 'no_hire'::"text", 'strong_no_hire'::"text"])))
);


ALTER TABLE "public"."candidate_evaluations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."card_style_presets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "background_class" "text" NOT NULL,
    "text_color_class" "text" DEFAULT 'foreground'::"text" NOT NULL,
    "icon_color_token" "text" DEFAULT 'primary'::"text",
    "icon_size" "text" DEFAULT 'default'::"text",
    "shadow_class" "text" DEFAULT 'shadow-none'::"text",
    "border_radius" "text" DEFAULT 'rounded-2xl'::"text",
    "is_system_preset" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."card_style_presets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."carousel_configs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "autoplay" boolean DEFAULT true NOT NULL,
    "autoplay_delay" integer DEFAULT 3500 NOT NULL,
    "show_navigation" boolean DEFAULT true NOT NULL,
    "show_dots" boolean DEFAULT true NOT NULL,
    "images" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."carousel_configs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."color_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "css_var" "text" NOT NULL,
    "value" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "label" "text",
    "color_type" "text" DEFAULT 'solid'::"text",
    "category" "text" DEFAULT 'surfaces'::"text",
    "optimal_text_color" "text" DEFAULT 'auto'::"text",
    "preview_class" "text",
    "sort_order" integer DEFAULT 0,
    "active" boolean DEFAULT true,
    CONSTRAINT "color_tokens_category_check" CHECK (("category" = ANY (ARRAY['surfaces'::"text", 'interactive'::"text", 'feedback'::"text", 'gradients'::"text", 'experimental'::"text", 'glass'::"text", 'text'::"text"]))),
    CONSTRAINT "color_tokens_color_type_check" CHECK (("color_type" = ANY (ARRAY['solid'::"text", 'gradient'::"text", 'glass'::"text"])))
);


ALTER TABLE "public"."color_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "value" "text" NOT NULL,
    "link_url" "text",
    "icon_name" "text" DEFAULT 'Mail'::"text" NOT NULL,
    "sort_order" integer DEFAULT 0,
    "active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."contact_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "form_title" "text" DEFAULT 'Send us a message'::"text" NOT NULL,
    "form_description" "text",
    "get_in_touch_title" "text" DEFAULT 'Get in touch'::"text" NOT NULL,
    "business_hours_title" "text" DEFAULT 'Business Hours'::"text" NOT NULL,
    "show_contact_methods_tab" boolean DEFAULT true NOT NULL,
    "show_business_hours_tab" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."contact_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."content_hierarchies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "page_id" "uuid" NOT NULL,
    "section_id" "uuid" NOT NULL,
    "content_type" "text" NOT NULL,
    "content_id" "uuid" NOT NULL,
    "sort_order" integer DEFAULT 0,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."content_hierarchies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customer_stories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "company_name" "text" NOT NULL,
    "company_logo_url" "text",
    "title" "text" NOT NULL,
    "hero_image_url" "text",
    "about_company" "text",
    "use_case" "text",
    "impact_statement" "text",
    "product_screenshot_url" "text",
    "quote_text" "text",
    "quote_author" "text",
    "quote_author_title" "text",
    "results" "jsonb" DEFAULT '[]'::"jsonb",
    "final_cta_heading" "text" DEFAULT 'Ready to transform your business?'::"text",
    "final_cta_description" "text",
    "final_cta_button_text" "text" DEFAULT 'Book a Demo'::"text",
    "final_cta_button_url" "text" DEFAULT '/contact'::"text",
    "active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "quote_author_image_url" "text"
);


ALTER TABLE "public"."customer_stories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email_type" "text" NOT NULL,
    "related_id" "uuid",
    "to_email" "text" NOT NULL,
    "to_name" "text",
    "from_address" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "resend_id" "text",
    "status" "text" DEFAULT 'sent'::"text",
    "sent_at" timestamp with time zone DEFAULT "now"(),
    "delivered_at" timestamp with time zone,
    "opened_at" timestamp with time zone,
    "clicked_at" timestamp with time zone,
    "bounced_at" timestamp with time zone,
    "error_message" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."email_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "template_key" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "subject" "text" NOT NULL,
    "heading" "text" NOT NULL,
    "body_html" "text" NOT NULL,
    "button_text" "text",
    "button_url" "text",
    "emoji" "text" DEFAULT '📧'::"text",
    "header_bg_start" "text" DEFAULT '#667eea'::"text",
    "header_bg_end" "text" DEFAULT '#764ba2'::"text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."email_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employees" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "name" "text" NOT NULL,
    "title" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "linkedin_url" "text",
    "image_url" "text",
    "section" "text" DEFAULT 'General'::"text" NOT NULL,
    "image_object_position" "text" DEFAULT 'center'::"text" NOT NULL,
    "section_id" "uuid",
    "slug" "text",
    "timezone" "text" DEFAULT 'Europe/Oslo'::"text",
    "google_calendar_connected" boolean DEFAULT false
);


ALTER TABLE "public"."employees" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."employees_public" WITH ("security_invoker"='true') AS
 SELECT "id",
    "name",
    "title",
    "image_url",
    "image_object_position",
    "section",
    "section_id",
    "sort_order",
    "active",
    "created_at",
    "updated_at"
   FROM "public"."employees"
  WHERE ("active" = true);


ALTER VIEW "public"."employees_public" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employees_sections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."employees_sections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employees_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "section_title" "text" DEFAULT 'Our Team'::"text" NOT NULL,
    "section_subtitle" "text",
    "background_token" "text" DEFAULT 'background'::"text" NOT NULL,
    "card_bg_token" "text" DEFAULT 'card'::"text" NOT NULL,
    "border_token" "text" DEFAULT 'border'::"text" NOT NULL,
    "name_token" "text" DEFAULT 'foreground'::"text" NOT NULL,
    "title_token" "text" DEFAULT 'muted-foreground'::"text" NOT NULL,
    "link_token" "text" DEFAULT 'primary'::"text" NOT NULL
);


ALTER TABLE "public"."employees_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."translations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "translation_key" "text" NOT NULL,
    "language_code" "text" NOT NULL,
    "translated_text" "text" NOT NULL,
    "context" "text",
    "page_location" "text",
    "approved" boolean DEFAULT false NOT NULL,
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "quality_score" integer,
    "quality_metrics" "jsonb",
    "review_status" "text" DEFAULT 'pending'::"text",
    "ai_reviewed_at" timestamp with time zone,
    "color_token" "text",
    "font_size" "text" DEFAULT 'base'::"text",
    "font_weight" "text" DEFAULT 'normal'::"text",
    "is_italic" boolean DEFAULT false,
    "is_underline" boolean DEFAULT false,
    "font_size_mobile" "text" DEFAULT 'base'::"text",
    "font_size_tablet" "text" DEFAULT 'base'::"text",
    "font_size_desktop" "text" DEFAULT 'base'::"text",
    "source_hash" "text",
    "source_updated_at" timestamp with time zone,
    "is_stale" boolean DEFAULT false,
    "is_intentionally_empty" boolean DEFAULT false,
    CONSTRAINT "quality_score_valid_range" CHECK ((("quality_score" IS NULL) OR ("quality_score" >= 1))),
    CONSTRAINT "translations_quality_score_check" CHECK ((("quality_score" >= 0) AND ("quality_score" <= 100))),
    CONSTRAINT "translations_review_status_check" CHECK (("review_status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'needs_review'::"text", 'rejected'::"text", 'needs_translation'::"text", 'stale'::"text"])))
);


ALTER TABLE "public"."translations" OWNER TO "postgres";


COMMENT ON COLUMN "public"."translations"."color_token" IS 'Text color token from color_tokens table (e.g., foreground, primary, success)';



COMMENT ON COLUMN "public"."translations"."font_size" IS 'Font size: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl';



COMMENT ON COLUMN "public"."translations"."font_weight" IS 'Font weight: light, normal, medium, semibold, bold, extrabold';



COMMENT ON COLUMN "public"."translations"."is_italic" IS 'Whether text should be displayed in italic style';



COMMENT ON COLUMN "public"."translations"."is_underline" IS 'Whether text should be underlined';



COMMENT ON COLUMN "public"."translations"."font_size_mobile" IS 'Font size for mobile viewports (<640px)';



COMMENT ON COLUMN "public"."translations"."font_size_tablet" IS 'Font size for tablet viewports (640px-1024px)';



COMMENT ON COLUMN "public"."translations"."font_size_desktop" IS 'Font size for desktop viewports (>1024px)';



COMMENT ON COLUMN "public"."translations"."is_intentionally_empty" IS 'Marks translations that are intentionally left empty (e.g., spacing elements, optional fields). These are excluded from health checks and warnings.';



CREATE OR REPLACE VIEW "public"."evaluated_counts_by_language" AS
 SELECT "language_code",
    "count"(*) FILTER (WHERE ("quality_score" >= 1)) AS "evaluated_count",
    "count"(*) AS "total_count"
   FROM "public"."translations"
  WHERE ("language_code" <> 'en'::"text")
  GROUP BY "language_code";


ALTER VIEW "public"."evaluated_counts_by_language" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."evaluation_batches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "language_code" "text" NOT NULL,
    "batch_number" integer NOT NULL,
    "batch_size" integer DEFAULT 20 NOT NULL,
    "evaluated_count" integer DEFAULT 0 NOT NULL,
    "failed_count" integer DEFAULT 0 NOT NULL,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone
);


ALTER TABLE "public"."evaluation_batches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."evaluation_criteria" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "max_score" integer DEFAULT 5,
    "weight" numeric DEFAULT 1.0,
    "category" "text" DEFAULT 'general'::"text",
    "active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."evaluation_criteria" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."evaluation_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "language_code" "text" NOT NULL,
    "total_keys" integer DEFAULT 0 NOT NULL,
    "evaluated_keys" integer DEFAULT 0 NOT NULL,
    "last_evaluated_key" "text",
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone,
    "status" "text" DEFAULT 'idle'::"text" NOT NULL,
    "error_message" "text",
    "batch_size" integer DEFAULT 20,
    "current_batch" integer DEFAULT 0,
    "error_count" integer DEFAULT 0,
    "last_error" "text",
    CONSTRAINT "evaluation_progress_status_check" CHECK (("status" = ANY (ARRAY['idle'::"text", 'in_progress'::"text", 'completed'::"text", 'paused'::"text", 'error'::"text"])))
);


ALTER TABLE "public"."evaluation_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."evaluation_scores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "evaluation_id" "uuid" NOT NULL,
    "criteria_id" "uuid" NOT NULL,
    "score" integer NOT NULL,
    "comment" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "evaluation_scores_score_check" CHECK (("score" >= 0))
);


ALTER TABLE "public"."evaluation_scores" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_type_availability" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_type_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "day_of_week" integer,
    "start_time" "text",
    "end_time" "text",
    "date_start" "date",
    "date_end" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "event_type_availability_type_check" CHECK (("type" = ANY (ARRAY['recurring'::"text", 'date_range'::"text"])))
);


ALTER TABLE "public"."event_type_availability" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_type_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_type_id" "uuid" NOT NULL,
    "team_member_id" "uuid" NOT NULL,
    "is_required" boolean DEFAULT false
);


ALTER TABLE "public"."event_type_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "duration_minutes" integer DEFAULT 30,
    "buffer_minutes" integer DEFAULT 15,
    "color" "text" DEFAULT '#2D1B69'::"text",
    "is_active" boolean DEFAULT true,
    "requires_all_members" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "min_duration_minutes" integer,
    "max_duration_minutes" integer,
    "duration_step_minutes" integer DEFAULT 15
);


ALTER TABLE "public"."event_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."faqs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "question" "text" NOT NULL,
    "answer" "text" NOT NULL,
    "type" "text" NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "faqs_type_check" CHECK (("type" = ANY (ARRAY['general'::"text", 'features'::"text", 'pricing'::"text"])))
);


ALTER TABLE "public"."faqs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."features" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "icon_name" "text" DEFAULT 'Sparkles'::"text" NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "section_id" "uuid"
);


ALTER TABLE "public"."features" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."features_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "section_title" "text" DEFAULT 'Platform Benefits'::"text" NOT NULL,
    "section_subtitle" "text",
    "background_token" "text" DEFAULT 'background'::"text" NOT NULL,
    "card_bg_token" "text" DEFAULT 'card'::"text" NOT NULL,
    "border_token" "text" DEFAULT 'border'::"text" NOT NULL,
    "icon_token" "text" DEFAULT 'primary'::"text" NOT NULL,
    "title_token" "text" DEFAULT 'foreground'::"text" NOT NULL,
    "description_token" "text" DEFAULT 'muted-foreground'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."features_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."footer_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_name" "text" DEFAULT 'Noddi Tech'::"text" NOT NULL,
    "company_description" "text",
    "contact_info" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "quick_links" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "legal_links" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "copyright_text" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."footer_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."google_oauth_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_member_id" "uuid" NOT NULL,
    "access_token_encrypted" "text" NOT NULL,
    "refresh_token_encrypted" "text" NOT NULL,
    "token_expiry" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."google_oauth_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."header_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "navigation_links" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "show_auth_buttons" boolean DEFAULT true NOT NULL,
    "sign_in_text" "text" DEFAULT 'Sign In'::"text" NOT NULL,
    "get_started_text" "text" DEFAULT 'Get Started'::"text" NOT NULL,
    "show_global_usp_bar" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "sign_in_url" "text" DEFAULT '/auth'::"text",
    "sign_up_url" "text" DEFAULT '/auth?tab=signup'::"text",
    "show_sign_in_button" boolean DEFAULT true,
    "show_sign_up_button" boolean DEFAULT true
);


ALTER TABLE "public"."header_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."icon_styles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "element_id" "text" NOT NULL,
    "background_token" "text" DEFAULT 'gradient-primary'::"text" NOT NULL,
    "icon_name" "text",
    "icon_color_token" "text" DEFAULT 'primary-foreground'::"text",
    "size" "text" DEFAULT 'default'::"text",
    "shape" "text" DEFAULT 'rounded-xl'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "icon_styles_size_check" CHECK (("size" = ANY (ARRAY['sm'::"text", 'default'::"text", 'lg'::"text", 'xl'::"text"])))
);


ALTER TABLE "public"."icon_styles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."image_carousel_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "location_id" "text" NOT NULL,
    "display_type" "text" DEFAULT 'image'::"text" NOT NULL,
    "image_url" "text",
    "image_alt" "text",
    "carousel_config_id" "uuid",
    "saved_image_url" "text",
    "saved_image_alt" "text",
    "saved_carousel_config_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "aspect_ratio" "text" DEFAULT 'auto'::"text",
    "fit_mode" "text" DEFAULT 'contain'::"text",
    "card_height" "text" DEFAULT 'h-[500px]'::"text",
    "card_width" "text" DEFAULT 'w-full'::"text",
    "card_border_radius" "text" DEFAULT 'rounded-2xl'::"text",
    "card_gap" "text" DEFAULT 'gap-8'::"text",
    "object_position" "text" DEFAULT 'center'::"text",
    CONSTRAINT "image_carousel_settings_aspect_ratio_check" CHECK (("aspect_ratio" = ANY (ARRAY['auto'::"text", '9:16'::"text", '10:16'::"text", '3:4'::"text", '1:1'::"text", '4:3'::"text", '16:10'::"text", '16:9'::"text", '21:9'::"text"]))),
    CONSTRAINT "image_carousel_settings_display_type_check" CHECK (("display_type" = ANY (ARRAY['image'::"text", 'carousel'::"text"]))),
    CONSTRAINT "image_carousel_settings_fit_mode_check" CHECK (("fit_mode" = ANY (ARRAY['contain'::"text", 'cover'::"text"]))),
    CONSTRAINT "image_carousel_settings_object_position_check" CHECK (("object_position" = ANY (ARRAY['top'::"text", 'center'::"text", 'bottom'::"text"])))
);


ALTER TABLE "public"."image_carousel_settings" OWNER TO "postgres";


COMMENT ON COLUMN "public"."image_carousel_settings"."aspect_ratio" IS 'Aspect ratio for the image/carousel container. "auto" detects from first image. Options: auto, 9:16 (phone portrait), 10:16 (tablet), 3:4 (portrait), 1:1 (square), 4:3 (classic), 16:10 (desktop), 16:9 (widescreen), 21:9 (ultrawide)';



COMMENT ON COLUMN "public"."image_carousel_settings"."fit_mode" IS 'How images fit inside the card container: "contain" shows full image with letterboxing, "cover" fills container and may crop';



COMMENT ON COLUMN "public"."image_carousel_settings"."card_height" IS 'Tailwind height class for card container (e.g., h-[500px])';



COMMENT ON COLUMN "public"."image_carousel_settings"."card_width" IS 'Tailwind width class for card container (e.g., w-full)';



COMMENT ON COLUMN "public"."image_carousel_settings"."card_border_radius" IS 'Tailwind border radius class for card container (e.g., rounded-2xl)';



COMMENT ON COLUMN "public"."image_carousel_settings"."card_gap" IS 'Tailwind gap class for spacing between cards (e.g., gap-8)';



COMMENT ON COLUMN "public"."image_carousel_settings"."object_position" IS 'Vertical focal point for cover mode images: top, center, or bottom';



CREATE TABLE IF NOT EXISTS "public"."image_sections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."image_sections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "alt" "text",
    "caption" "text",
    "section" "text",
    "file_name" "text" NOT NULL,
    "file_url" "text" NOT NULL,
    "sort_order" integer DEFAULT 0,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "link_url" "text",
    "section_id" "uuid",
    "caption_position" "text" DEFAULT 'below'::"text" NOT NULL,
    "title_color_token" "text" DEFAULT 'foreground'::"text",
    "caption_color_token" "text" DEFAULT 'muted-foreground'::"text"
);


ALTER TABLE "public"."images" OWNER TO "postgres";


COMMENT ON COLUMN "public"."images"."section" IS 'Section assignment for images. NULL or "Library" means unassigned images in the library.';



CREATE TABLE IF NOT EXISTS "public"."interview_reminders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "interview_id" "uuid",
    "interviewer_id" "uuid",
    "interviewer_email" "text" NOT NULL,
    "interviewer_name" "text",
    "reminder_type" "text" DEFAULT 'post_interview'::"text" NOT NULL,
    "scheduled_for" timestamp with time zone NOT NULL,
    "sent_at" timestamp with time zone,
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."interview_reminders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."interview_slots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "interviewer_id" "uuid",
    "interviewer_name" "text" NOT NULL,
    "interviewer_email" "text",
    "interview_type" "text" DEFAULT 'phone_screen'::"text" NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "duration_minutes" integer DEFAULT 30 NOT NULL,
    "is_available" boolean DEFAULT true NOT NULL,
    "booked_by_application_id" "uuid",
    "booking_token" "text",
    "booking_token_expires_at" timestamp with time zone,
    "location" "text",
    "meeting_url" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."interview_slots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."interviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "application_id" "uuid" NOT NULL,
    "interview_type" "text" DEFAULT 'technical'::"text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "scheduled_at" timestamp with time zone NOT NULL,
    "duration_minutes" integer DEFAULT 60,
    "location" "text",
    "meeting_url" "text",
    "calendar_event_id" "text",
    "interviewer_ids" "uuid"[],
    "interviewer_names" "text"[],
    "status" "text" DEFAULT 'scheduled'::"text",
    "notes" "text",
    "feedback" "text",
    "candidate_notified" boolean DEFAULT false,
    "reminder_sent" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "interviews_status_check" CHECK (("status" = ANY (ARRAY['scheduled'::"text", 'completed'::"text", 'cancelled'::"text", 'rescheduled'::"text", 'no_show'::"text"])))
);


ALTER TABLE "public"."interviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "job_id" "uuid" NOT NULL,
    "applicant_name" "text" NOT NULL,
    "applicant_email" "text" NOT NULL,
    "applicant_phone" "text",
    "linkedin_url" "text",
    "portfolio_url" "text",
    "resume_url" "text",
    "cover_letter" "text",
    "status" "text" DEFAULT 'submitted'::"text",
    "status_updated_at" timestamp with time zone DEFAULT "now"(),
    "internal_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "source" "text" DEFAULT 'direct'::"text",
    "source_detail" "text",
    "referrer_email" "text",
    "utm_source" "text",
    "utm_medium" "text",
    "utm_campaign" "text",
    CONSTRAINT "job_applications_status_check" CHECK (("status" = ANY (ARRAY['submitted'::"text", 'under_review'::"text", 'interview_scheduled'::"text", 'interview_completed'::"text", 'offer_extended'::"text", 'hired'::"text", 'rejected'::"text", 'withdrawn'::"text"])))
);


ALTER TABLE "public"."job_applications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_listings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "department" "text",
    "location" "text",
    "employment_type" "text",
    "description" "text",
    "requirements" "text",
    "benefits" "text",
    "salary_range" "text",
    "application_url" "text",
    "application_email" "text",
    "active" boolean DEFAULT true,
    "featured" boolean DEFAULT false,
    "sort_order" integer DEFAULT 0,
    "posted_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "company_intro" "text",
    "work_assignments" "jsonb" DEFAULT '[]'::"jsonb",
    "tech_stack" "jsonb" DEFAULT '[]'::"jsonb"
);


ALTER TABLE "public"."job_listings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."language_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "enable_browser_detection" boolean DEFAULT true NOT NULL,
    "show_language_switcher_header" boolean DEFAULT true NOT NULL,
    "show_language_switcher_footer" boolean DEFAULT true NOT NULL,
    "default_language_code" "text" DEFAULT 'en'::"text" NOT NULL,
    "fallback_language_code" "text" DEFAULT 'en'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."language_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."languages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "native_name" "text" NOT NULL,
    "flag_code" "text" NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL,
    "sort_order" integer DEFAULT 0,
    "rtl" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "show_in_switcher" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."languages" OWNER TO "postgres";


COMMENT ON COLUMN "public"."languages"."show_in_switcher" IS 'Controls whether language appears in header/footer language switchers';



CREATE MATERIALIZED VIEW "public"."language_translation_stats" AS
 SELECT "l"."code",
    "l"."name",
    "l"."enabled",
    "l"."sort_order",
    "count"("t"."id") AS "total_translations",
    "count"("t"."id") FILTER (WHERE ("t"."approved" = true)) AS "approved_translations",
    "round"(((("count"("t"."id") FILTER (WHERE ("t"."approved" = true)))::numeric / (NULLIF("count"("t"."id"), 0))::numeric) * (100)::numeric), 2) AS "approval_percentage",
    "round"("avg"("t"."quality_score"), 2) AS "avg_quality_score",
    "count"("t"."id") FILTER (WHERE ("t"."quality_score" >= 80)) AS "high_quality_count",
    "count"("t"."id") FILTER (WHERE (("t"."quality_score" >= 60) AND ("t"."quality_score" < 80))) AS "medium_quality_count",
    "count"("t"."id") FILTER (WHERE ("t"."quality_score" < 60)) AS "low_quality_count",
    "count"("t"."id") FILTER (WHERE ("t"."review_status" = 'pending'::"text")) AS "needs_review_count"
   FROM ("public"."languages" "l"
     LEFT JOIN "public"."translations" "t" ON (("t"."language_code" = "l"."code")))
  GROUP BY "l"."code", "l"."name", "l"."enabled", "l"."sort_order"
  WITH NO DATA;


ALTER MATERIALIZED VIEW "public"."language_translation_stats" OWNER TO "postgres";


COMMENT ON MATERIALIZED VIEW "public"."language_translation_stats" IS 'Cached statistics for language translations. Refresh using refresh_language_translation_stats() function.';



CREATE TABLE IF NOT EXISTS "public"."lead_activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "lead_id" "uuid" NOT NULL,
    "activity_type" "text" NOT NULL,
    "description" "text",
    "metadata" "jsonb",
    "created_by" "uuid",
    CONSTRAINT "lead_activities_activity_type_check" CHECK (("activity_type" = ANY (ARRAY['note'::"text", 'email'::"text", 'call'::"text", 'meeting'::"text", 'offer_sent'::"text", 'status_change'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."lead_activities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "company_name" "text" NOT NULL,
    "contact_name" "text",
    "email" "text",
    "phone" "text",
    "website" "text",
    "industry" "text",
    "estimated_revenue" numeric(15,2),
    "estimated_locations" integer,
    "status" "text" DEFAULT 'new'::"text" NOT NULL,
    "source" "text",
    "source_detail" "text",
    "notes" "text",
    "last_contacted_at" timestamp with time zone,
    "next_follow_up_at" timestamp with time zone,
    "assigned_to" "uuid",
    "created_by" "uuid",
    CONSTRAINT "leads_status_check" CHECK (("status" = ANY (ARRAY['new'::"text", 'contacted'::"text", 'meeting_scheduled'::"text", 'meeting_done'::"text", 'offer_sent'::"text", 'negotiating'::"text", 'won'::"text", 'lost'::"text", 'on_hold'::"text"])))
);


ALTER TABLE "public"."leads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."legal_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "document_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" DEFAULT ''::"text" NOT NULL,
    "version_label" "text",
    "effective_date" "date",
    "last_updated" timestamp with time zone DEFAULT "now"() NOT NULL,
    "published" boolean DEFAULT false NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."legal_documents" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."live_translation_stats" WITH ("security_invoker"='true') AS
 WITH "english_keys" AS (
         SELECT "count"(*) AS "total_english_keys",
            "count"(
                CASE
                    WHEN (("translations"."translated_text" IS NOT NULL) AND ("translations"."translated_text" <> ''::"text")) THEN 1
                    ELSE NULL::integer
                END) AS "actual_english_keys"
           FROM "public"."translations"
          WHERE ("translations"."language_code" = 'en'::"text")
        )
 SELECT "l"."code",
    "l"."name",
    "l"."enabled",
    "l"."show_in_switcher",
    "l"."sort_order",
    "ek"."total_english_keys" AS "english_key_count",
    "count"("t"."id") AS "total_rows",
    "count"(
        CASE
            WHEN (("t"."translated_text" IS NOT NULL) AND ("t"."translated_text" <> ''::"text")) THEN 1
            ELSE NULL::integer
        END) AS "actual_translations",
    "count"(
        CASE
            WHEN (("t"."translated_text" IS NULL) OR ("t"."translated_text" = ''::"text")) THEN 1
            ELSE NULL::integer
        END) AS "empty_count",
    "count"(
        CASE
            WHEN ("t"."is_stale" = true) THEN 1
            ELSE NULL::integer
        END) AS "stale_count",
    "count"(
        CASE
            WHEN ("t"."approved" = true) THEN 1
            ELSE NULL::integer
        END) AS "approved_count",
    "count"(
        CASE
            WHEN (("t"."quality_score" IS NOT NULL) AND ("t"."quality_score" >= 1)) THEN 1
            ELSE NULL::integer
        END) AS "evaluated_count",
    "round"("avg"(
        CASE
            WHEN (("t"."quality_score" IS NOT NULL) AND ("t"."quality_score" >= 1)) THEN "t"."quality_score"
            ELSE NULL::integer
        END), 1) AS "avg_quality_score",
    ("ek"."total_english_keys" - "count"("t"."id")) AS "missing_rows"
   FROM (("public"."languages" "l"
     CROSS JOIN "english_keys" "ek")
     LEFT JOIN "public"."translations" "t" ON (("t"."language_code" = "l"."code")))
  WHERE ("l"."enabled" = true)
  GROUP BY "l"."code", "l"."name", "l"."enabled", "l"."show_in_switcher", "l"."sort_order", "ek"."total_english_keys", "ek"."actual_english_keys"
  ORDER BY "l"."sort_order";


ALTER VIEW "public"."live_translation_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."newsletter_subscribers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "subscribed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "confirmed" boolean DEFAULT false,
    "unsubscribed_at" timestamp with time zone,
    "source" "text" DEFAULT 'blog'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."newsletter_subscribers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."page_meta_translations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "page_slug" "text" NOT NULL,
    "language_code" "text" NOT NULL,
    "meta_title" "text" NOT NULL,
    "meta_description" "text",
    "meta_keywords" "text",
    "og_title" "text",
    "og_description" "text",
    "og_image_url" "text",
    "twitter_title" "text",
    "twitter_description" "text",
    "twitter_image_url" "text",
    "canonical_url" "text",
    "quality_score" integer,
    "review_status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "page_meta_translations_quality_score_check" CHECK ((("quality_score" >= 0) AND ("quality_score" <= 100))),
    CONSTRAINT "page_meta_translations_review_status_check" CHECK (("review_status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'needs_review'::"text", 'rejected'::"text"]))),
    CONSTRAINT "page_slug_format_check" CHECK ((("page_slug" = '/'::"text") OR ("page_slug" !~~ '/%'::"text")))
);


ALTER TABLE "public"."page_meta_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "meta_description" "text",
    "meta_keywords" "text",
    "default_background_token" "text" DEFAULT 'background'::"text" NOT NULL,
    "default_text_token" "text" DEFAULT 'foreground'::"text" NOT NULL,
    "default_padding_token" "text" DEFAULT 'section'::"text" NOT NULL,
    "default_margin_token" "text" DEFAULT 'none'::"text" NOT NULL,
    "default_max_width_token" "text" DEFAULT 'container'::"text" NOT NULL,
    "layout_type" "text" DEFAULT 'standard'::"text" NOT NULL,
    "container_width" "text" DEFAULT 'container'::"text" NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "published" boolean DEFAULT true NOT NULL,
    "header_id" "uuid",
    "footer_id" "uuid",
    "brand_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."pages" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."page_meta_stats" WITH ("security_invoker"='on') AS
 SELECT "l"."code",
    "l"."name",
    "l"."enabled",
    "l"."sort_order",
    "count"(DISTINCT "p"."slug") AS "total_pages",
    "count"("pm"."id") AS "completed_entries",
    ("count"(DISTINCT "p"."slug") - "count"("pm"."id")) AS "missing_entries",
    "round"("avg"("pm"."quality_score")) AS "avg_quality_score",
    "count"(
        CASE
            WHEN ("pm"."review_status" = 'needs_review'::"text") THEN 1
            ELSE NULL::integer
        END) AS "needs_review_count",
    "count"(
        CASE
            WHEN ("pm"."review_status" = 'approved'::"text") THEN 1
            ELSE NULL::integer
        END) AS "approved_count"
   FROM (("public"."languages" "l"
     CROSS JOIN ( SELECT DISTINCT "pages"."slug"
           FROM "public"."pages"
          WHERE ("pages"."published" = true)) "p")
     LEFT JOIN "public"."page_meta_translations" "pm" ON ((("pm"."language_code" = "l"."code") AND ("pm"."page_slug" = "p"."slug"))))
  WHERE ("l"."enabled" = true)
  GROUP BY "l"."code", "l"."name", "l"."enabled", "l"."sort_order"
  ORDER BY "l"."sort_order";


ALTER VIEW "public"."page_meta_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."press_mentions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "source_name" "text" NOT NULL,
    "source_logo_url" "text",
    "article_url" "text" NOT NULL,
    "published_at" timestamp with time zone,
    "excerpt" "text",
    "category" "text" DEFAULT 'media_coverage'::"text" NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "featured" boolean DEFAULT false NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."press_mentions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pricing_offers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "customer_name" "text" NOT NULL,
    "customer_email" "text" NOT NULL,
    "customer_company" "text",
    "customer_phone" "text",
    "tier" "text" NOT NULL,
    "annual_revenue" numeric(15,2),
    "locations" integer DEFAULT 1,
    "fixed_monthly" numeric(10,2) NOT NULL,
    "revenue_percentage" numeric(5,4) NOT NULL,
    "per_location_cost" numeric(10,2),
    "discount_percentage" numeric(5,2) DEFAULT 0,
    "discount_reason" "text",
    "total_monthly_estimate" numeric(12,2),
    "total_yearly_estimate" numeric(14,2),
    "currency" "text" DEFAULT 'EUR'::"text",
    "notes" "text",
    "internal_notes" "text",
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "expires_at" timestamp with time zone,
    "sent_at" timestamp with time zone,
    "viewed_at" timestamp with time zone,
    "created_by" "uuid",
    "lead_id" "uuid",
    "offer_token" "text" DEFAULT "encode"("extensions"."gen_random_bytes"(32), 'hex'::"text"),
    "last_question_at" timestamp with time zone,
    "accepted_at" timestamp with time zone,
    "resend_id" "text",
    "conversion_rate" numeric DEFAULT 1,
    "reminder_7_sent_at" timestamp with time zone,
    "reminder_3_sent_at" timestamp with time zone,
    "reminder_1_sent_at" timestamp with time zone,
    CONSTRAINT "pricing_offers_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'sent'::"text", 'viewed'::"text", 'accepted'::"text", 'declined'::"text", 'expired'::"text"]))),
    CONSTRAINT "pricing_offers_tier_check" CHECK (("tier" = ANY (ARRAY['launch'::"text", 'scale'::"text"])))
);


ALTER TABLE "public"."pricing_offers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pricing_scale_tiers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tier_number" integer NOT NULL,
    "revenue_threshold" numeric NOT NULL,
    "take_rate" numeric NOT NULL,
    "revenue_multiplier" numeric,
    "rate_reduction" numeric,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "pricing_scale_tiers_tier_number_check" CHECK ((("tier_number" >= 1) AND ("tier_number" <= 15)))
);


ALTER TABLE "public"."pricing_scale_tiers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pricing_tiers_config" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tier_type" "text" NOT NULL,
    "fixed_monthly_cost" numeric DEFAULT 0 NOT NULL,
    "per_department_cost" numeric DEFAULT 0,
    "revenue_percentage" numeric DEFAULT 0.03 NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "base_revenue_threshold" numeric(15,2) DEFAULT 1000000,
    CONSTRAINT "pricing_tiers_config_tier_type_check" CHECK (("tier_type" = ANY (ARRAY['launch'::"text", 'scale'::"text"])))
);


ALTER TABLE "public"."pricing_tiers_config" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."public_employees" WITH ("security_invoker"='true') AS
 SELECT "id",
    "name",
    "title",
    "image_url",
    "image_object_position",
    "section",
    "section_id",
    "sort_order",
    "active",
    "created_at",
    "updated_at"
   FROM "public"."employees"
  WHERE ("active" = true);


ALTER VIEW "public"."public_employees" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."referral_sources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "category" "text" NOT NULL,
    "tracking_code" "text",
    "icon_name" "text" DEFAULT 'Link'::"text",
    "active" boolean DEFAULT true NOT NULL,
    "sort_order" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."referral_sources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rotating_headline_terms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "term_key" "text" NOT NULL,
    "descriptor_key" "text" NOT NULL,
    "term_fallback" "text" NOT NULL,
    "descriptor_fallback" "text" NOT NULL,
    "icon_name" "text" DEFAULT 'Sparkles'::"text",
    "active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."rotating_headline_terms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sales_contact_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "setting_key" "text" NOT NULL,
    "employee_id" "uuid",
    "value" "text",
    "label" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sales_contact_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "job_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."saved_jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "page_location" "text" DEFAULT 'homepage'::"text" NOT NULL,
    "position_after" "text",
    "position_before" "text",
    "background_token" "text" DEFAULT 'background'::"text" NOT NULL,
    "text_token" "text" DEFAULT 'foreground'::"text" NOT NULL,
    "padding_token" "text" DEFAULT 'section'::"text" NOT NULL,
    "margin_token" "text" DEFAULT 'none'::"text" NOT NULL,
    "max_width_token" "text" DEFAULT 'container'::"text" NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "page_id" "uuid",
    "inherit_page_defaults" boolean DEFAULT true NOT NULL,
    "background_token_override" "text",
    "text_token_override" "text",
    "padding_token_override" "text",
    "margin_token_override" "text",
    "max_width_token_override" "text"
);


ALTER TABLE "public"."sections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "setting_key" "text" NOT NULL,
    "setting_value" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."site_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."slack_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category" "text" NOT NULL,
    "webhook_url" "text",
    "enabled" boolean DEFAULT true,
    "channel_name" "text",
    "notification_types" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."slack_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."solutions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "subtitle" "text",
    "description" "text",
    "icon_name" "text" DEFAULT 'Sparkles'::"text" NOT NULL,
    "image_url" "text",
    "cta_text" "text",
    "cta_url" "text",
    "benefits" "jsonb" DEFAULT '[]'::"jsonb",
    "sort_order" integer DEFAULT 0,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "hero_title" "text",
    "hero_subtitle" "text",
    "hero_description" "text",
    "hero_image_url" "text",
    "hero_cta_text" "text",
    "hero_cta_url" "text",
    "description_heading" "text",
    "description_text" "text",
    "key_benefits" "jsonb" DEFAULT '[]'::"jsonb",
    "footer_heading" "text",
    "footer_text" "text",
    "footer_cta_text" "text",
    "footer_cta_url" "text",
    "slug" "text" NOT NULL,
    "footer_cta_bg_color" "text" DEFAULT 'primary'::"text",
    "footer_cta_icon" "text" DEFAULT ''::"text",
    "footer_cta_text_color" "text" DEFAULT 'white'::"text",
    "hero_cta_bg_color" "text" DEFAULT 'primary'::"text",
    "hero_cta_icon" "text" DEFAULT ''::"text",
    "hero_cta_text_color" "text" DEFAULT 'white'::"text"
);


ALTER TABLE "public"."solutions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."solutions"."key_benefits" IS 'Array of objects with: heading (string), text (string), image_url (string)';



CREATE TABLE IF NOT EXISTS "public"."solutions_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "section_title" "text" DEFAULT 'Solutions'::"text" NOT NULL,
    "section_subtitle" "text",
    "background_token" "text" DEFAULT 'background'::"text" NOT NULL,
    "card_bg_token" "text" DEFAULT 'card'::"text" NOT NULL,
    "border_token" "text" DEFAULT 'border'::"text" NOT NULL,
    "icon_token" "text" DEFAULT 'primary'::"text" NOT NULL,
    "title_token" "text" DEFAULT 'foreground'::"text" NOT NULL,
    "subtitle_token" "text" DEFAULT 'muted-foreground'::"text" NOT NULL,
    "description_token" "text" DEFAULT 'muted-foreground'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."solutions_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."static_files" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "file_path" "text" NOT NULL,
    "content" "text" NOT NULL,
    "mime_type" "text" DEFAULT 'text/plain'::"text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."static_files" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tech_stack_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "logo_url" "text",
    "category" "text" DEFAULT 'general'::"text",
    "description" "text",
    "sort_order" integer DEFAULT 0,
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tech_stack_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."tech_stack_items" IS 'Reusable tech stack items with logos for job listings';



CREATE TABLE IF NOT EXISTS "public"."testimonial_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_story_id" "uuid",
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."testimonial_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."text_content" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "page_location" "text" NOT NULL,
    "section" "text" NOT NULL,
    "element_type" "text" NOT NULL,
    "content" "text" NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "color_token" "text" DEFAULT 'foreground'::"text",
    "content_type" character varying(50) DEFAULT 'heading'::character varying,
    "element_id" "text",
    "button_url" "text",
    "button_bg_color" "text" DEFAULT 'primary'::"text",
    "button_icon" "text" DEFAULT 'ArrowRight'::"text"
);


ALTER TABLE "public"."text_content" OWNER TO "postgres";


COMMENT ON COLUMN "public"."text_content"."element_id" IS 'Simplified identifier for CMS editing. Replaces compound key of page_location+section+element_type for direct element targeting.';



COMMENT ON COLUMN "public"."text_content"."button_icon" IS 'Icon name from Lucide icons library to display in button (optional)';



CREATE OR REPLACE VIEW "public"."translation_stats" AS
 SELECT "l"."code",
    "l"."name",
    "l"."enabled",
    "l"."sort_order",
    ("count"("t"."id"))::integer AS "total_translations",
    ("count"(
        CASE
            WHEN (("t"."translated_text" IS NOT NULL) AND ("t"."translated_text" <> ''::"text")) THEN 1
            ELSE NULL::integer
        END))::integer AS "actual_translations",
    ("count"(
        CASE
            WHEN (("t"."translated_text" IS NULL) OR ("t"."translated_text" = ''::"text")) THEN 1
            ELSE NULL::integer
        END))::integer AS "missing_translations",
    ("count"(
        CASE
            WHEN (("t"."approved" = true) AND ("t"."translated_text" IS NOT NULL) AND ("t"."translated_text" <> ''::"text")) THEN 1
            ELSE NULL::integer
        END))::integer AS "approved_translations",
        CASE
            WHEN ("count"(
            CASE
                WHEN (("t"."translated_text" IS NOT NULL) AND ("t"."translated_text" <> ''::"text")) THEN 1
                ELSE NULL::integer
            END) > 0) THEN "round"(((("count"(
            CASE
                WHEN (("t"."approved" = true) AND ("t"."translated_text" IS NOT NULL) AND ("t"."translated_text" <> ''::"text")) THEN 1
                ELSE NULL::integer
            END))::numeric / ("count"(
            CASE
                WHEN (("t"."translated_text" IS NOT NULL) AND ("t"."translated_text" <> ''::"text")) THEN 1
                ELSE NULL::integer
            END))::numeric) * (100)::numeric), 2)
            ELSE (0)::numeric
        END AS "approval_percentage",
    "round"("avg"("t"."quality_score"), 2) AS "avg_quality_score",
    ("count"(
        CASE
            WHEN ("t"."quality_score" >= 85) THEN 1
            ELSE NULL::integer
        END))::integer AS "high_quality_count",
    ("count"(
        CASE
            WHEN (("t"."quality_score" >= 70) AND ("t"."quality_score" < 85)) THEN 1
            ELSE NULL::integer
        END))::integer AS "medium_quality_count",
    ("count"(
        CASE
            WHEN (("t"."quality_score" < 70) AND ("t"."quality_score" >= 1)) THEN 1
            ELSE NULL::integer
        END))::integer AS "low_quality_count",
    ("count"(
        CASE
            WHEN ("t"."review_status" = 'needs_review'::"text") THEN 1
            ELSE NULL::integer
        END))::integer AS "needs_review_count"
   FROM ("public"."languages" "l"
     LEFT JOIN "public"."translations" "t" ON (("l"."code" = "t"."language_code")))
  WHERE ("l"."enabled" = true)
  GROUP BY "l"."code", "l"."name", "l"."enabled", "l"."sort_order"
  ORDER BY "l"."sort_order";


ALTER VIEW "public"."translation_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."typography_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "font_family_name" "text" DEFAULT 'Atkinson Hyperlegible Next'::"text" NOT NULL,
    "font_source" "text" DEFAULT 'google'::"text" NOT NULL,
    "font_google_url" "text" DEFAULT 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:ital,wght@0,100..800;1,100..800&display=swap'::"text",
    "font_files" "jsonb" DEFAULT '[]'::"jsonb",
    "fallback_fonts" "text"[] DEFAULT ARRAY['system-ui'::"text", '-apple-system'::"text", 'sans-serif'::"text"],
    "mono_font_family_name" "text" DEFAULT 'Atkinson Hyperlegible Mono'::"text",
    "mono_font_source" "text" DEFAULT 'google'::"text",
    "mono_font_google_url" "text" DEFAULT 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono:wght@400;700&display=swap'::"text",
    "mono_font_files" "jsonb" DEFAULT '[]'::"jsonb",
    "mono_fallback_fonts" "text"[] DEFAULT ARRAY['ui-monospace'::"text", 'SFMono-Regular'::"text", 'monospace'::"text"],
    "typography_scale" "jsonb" DEFAULT '[]'::"jsonb",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."typography_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."app_role" DEFAULT 'viewer'::"public"."app_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "icon_name" "text" DEFAULT 'Sparkles'::"text" NOT NULL,
    "href" "text",
    "bg_token" "text" DEFAULT 'secondary'::"text" NOT NULL,
    "text_token" "text" DEFAULT 'foreground'::"text" NOT NULL,
    "location" "text" DEFAULT 'hero'::"text" NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "format" "text" DEFAULT 'usp'::"text" NOT NULL,
    "metric_value" "text",
    "metric_description" "text",
    "metric_style" "text" DEFAULT 'card'::"text" NOT NULL,
    "metric_align" "text" DEFAULT 'center'::"text" NOT NULL,
    "metric_value_size" "text" DEFAULT 'xl'::"text" NOT NULL,
    "metric_emphasis" "text" DEFAULT 'gradient'::"text" NOT NULL,
    "metric_suffix" "text",
    "metric_show_icon" boolean DEFAULT true NOT NULL,
    "section_id" "uuid"
);


ALTER TABLE "public"."usps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."video_sections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."video_sections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."videos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "section" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_url" "text" NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "thumbnail_shape" "text" DEFAULT 'rectangle'::"text" NOT NULL,
    "thumbnail_url" "text"
);


ALTER TABLE "public"."videos" OWNER TO "postgres";


ALTER TABLE ONLY "public"."application_activity_log"
    ADD CONSTRAINT "application_activity_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."application_messages"
    ADD CONSTRAINT "application_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."availability_rules"
    ADD CONSTRAINT "availability_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."availability_rules"
    ADD CONSTRAINT "availability_rules_team_member_id_day_of_week_key" UNIQUE ("team_member_id", "day_of_week");



ALTER TABLE ONLY "public"."background_styles"
    ADD CONSTRAINT "background_styles_element_id_key" UNIQUE ("element_id");



ALTER TABLE ONLY "public"."background_styles"
    ADD CONSTRAINT "background_styles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_categories"
    ADD CONSTRAINT "blog_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."blog_categories"
    ADD CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_categories"
    ADD CONSTRAINT "blog_categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."blog_tags"
    ADD CONSTRAINT "blog_tags_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."blog_tags"
    ADD CONSTRAINT "blog_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_tags"
    ADD CONSTRAINT "blog_tags_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."booking_members"
    ADD CONSTRAINT "booking_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_cancel_token_key" UNIQUE ("cancel_token");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brand_settings"
    ADD CONSTRAINT "brand_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."business_hours"
    ADD CONSTRAINT "business_hours_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."candidate_evaluations"
    ADD CONSTRAINT "candidate_evaluations_application_id_evaluator_id_key" UNIQUE ("application_id", "evaluator_id");



ALTER TABLE ONLY "public"."candidate_evaluations"
    ADD CONSTRAINT "candidate_evaluations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."card_style_presets"
    ADD CONSTRAINT "card_style_presets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."carousel_configs"
    ADD CONSTRAINT "carousel_configs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."color_tokens"
    ADD CONSTRAINT "color_tokens_css_var_key" UNIQUE ("css_var");



ALTER TABLE ONLY "public"."color_tokens"
    ADD CONSTRAINT "color_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_items"
    ADD CONSTRAINT "contact_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_settings"
    ADD CONSTRAINT "contact_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."content_hierarchies"
    ADD CONSTRAINT "content_hierarchies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customer_stories"
    ADD CONSTRAINT "customer_stories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customer_stories"
    ADD CONSTRAINT "customer_stories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."email_logs"
    ADD CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_templates"
    ADD CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_templates"
    ADD CONSTRAINT "email_templates_template_key_key" UNIQUE ("template_key");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employees_sections"
    ADD CONSTRAINT "employees_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employees_settings"
    ADD CONSTRAINT "employees_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."evaluation_batches"
    ADD CONSTRAINT "evaluation_batches_language_code_batch_number_key" UNIQUE ("language_code", "batch_number");



ALTER TABLE ONLY "public"."evaluation_batches"
    ADD CONSTRAINT "evaluation_batches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."evaluation_criteria"
    ADD CONSTRAINT "evaluation_criteria_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."evaluation_progress"
    ADD CONSTRAINT "evaluation_progress_language_code_key" UNIQUE ("language_code");



ALTER TABLE ONLY "public"."evaluation_progress"
    ADD CONSTRAINT "evaluation_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."evaluation_scores"
    ADD CONSTRAINT "evaluation_scores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_type_availability"
    ADD CONSTRAINT "event_type_availability_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_type_members"
    ADD CONSTRAINT "event_type_members_event_type_id_team_member_id_key" UNIQUE ("event_type_id", "team_member_id");



ALTER TABLE ONLY "public"."event_type_members"
    ADD CONSTRAINT "event_type_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_types"
    ADD CONSTRAINT "event_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_types"
    ADD CONSTRAINT "event_types_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."faqs"
    ADD CONSTRAINT "faqs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."features"
    ADD CONSTRAINT "features_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."features_settings"
    ADD CONSTRAINT "features_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."footer_settings"
    ADD CONSTRAINT "footer_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."google_oauth_tokens"
    ADD CONSTRAINT "google_oauth_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."google_oauth_tokens"
    ADD CONSTRAINT "google_oauth_tokens_team_member_id_key" UNIQUE ("team_member_id");



ALTER TABLE ONLY "public"."header_settings"
    ADD CONSTRAINT "header_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."text_content"
    ADD CONSTRAINT "headings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."icon_styles"
    ADD CONSTRAINT "icon_styles_element_id_key" UNIQUE ("element_id");



ALTER TABLE ONLY "public"."icon_styles"
    ADD CONSTRAINT "icon_styles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."image_carousel_settings"
    ADD CONSTRAINT "image_carousel_settings_location_id_key" UNIQUE ("location_id");



ALTER TABLE ONLY "public"."image_carousel_settings"
    ADD CONSTRAINT "image_carousel_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."image_sections"
    ADD CONSTRAINT "image_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."images"
    ADD CONSTRAINT "images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interview_reminders"
    ADD CONSTRAINT "interview_reminders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interview_slots"
    ADD CONSTRAINT "interview_slots_booking_token_key" UNIQUE ("booking_token");



ALTER TABLE ONLY "public"."interview_slots"
    ADD CONSTRAINT "interview_slots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interviews"
    ADD CONSTRAINT "interviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_applications"
    ADD CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_listings"
    ADD CONSTRAINT "job_listings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_listings"
    ADD CONSTRAINT "job_listings_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."language_settings"
    ADD CONSTRAINT "language_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."languages"
    ADD CONSTRAINT "languages_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."languages"
    ADD CONSTRAINT "languages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lead_activities"
    ADD CONSTRAINT "lead_activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."legal_documents"
    ADD CONSTRAINT "legal_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."newsletter_subscribers"
    ADD CONSTRAINT "newsletter_subscribers_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."newsletter_subscribers"
    ADD CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."page_meta_translations"
    ADD CONSTRAINT "page_meta_translations_page_slug_language_code_key" UNIQUE ("page_slug", "language_code");



ALTER TABLE ONLY "public"."page_meta_translations"
    ADD CONSTRAINT "page_meta_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pages"
    ADD CONSTRAINT "pages_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."pages"
    ADD CONSTRAINT "pages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pages"
    ADD CONSTRAINT "pages_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."press_mentions"
    ADD CONSTRAINT "press_mentions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pricing_offers"
    ADD CONSTRAINT "pricing_offers_offer_token_key" UNIQUE ("offer_token");



ALTER TABLE ONLY "public"."pricing_offers"
    ADD CONSTRAINT "pricing_offers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pricing_scale_tiers"
    ADD CONSTRAINT "pricing_scale_tiers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pricing_scale_tiers"
    ADD CONSTRAINT "pricing_scale_tiers_tier_number_key" UNIQUE ("tier_number");



ALTER TABLE ONLY "public"."pricing_tiers_config"
    ADD CONSTRAINT "pricing_tiers_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pricing_tiers_config"
    ADD CONSTRAINT "pricing_tiers_config_tier_type_key" UNIQUE ("tier_type");



ALTER TABLE ONLY "public"."referral_sources"
    ADD CONSTRAINT "referral_sources_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."referral_sources"
    ADD CONSTRAINT "referral_sources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."referral_sources"
    ADD CONSTRAINT "referral_sources_tracking_code_key" UNIQUE ("tracking_code");



ALTER TABLE ONLY "public"."rotating_headline_terms"
    ADD CONSTRAINT "rotating_headline_terms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sales_contact_settings"
    ADD CONSTRAINT "sales_contact_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sales_contact_settings"
    ADD CONSTRAINT "sales_contact_settings_setting_key_key" UNIQUE ("setting_key");



ALTER TABLE ONLY "public"."saved_jobs"
    ADD CONSTRAINT "saved_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_jobs"
    ADD CONSTRAINT "saved_jobs_user_id_job_id_key" UNIQUE ("user_id", "job_id");



ALTER TABLE ONLY "public"."sections"
    ADD CONSTRAINT "sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_setting_key_key" UNIQUE ("setting_key");



ALTER TABLE ONLY "public"."slack_settings"
    ADD CONSTRAINT "slack_settings_category_key" UNIQUE ("category");



ALTER TABLE ONLY "public"."slack_settings"
    ADD CONSTRAINT "slack_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."solutions"
    ADD CONSTRAINT "solutions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."solutions_settings"
    ADD CONSTRAINT "solutions_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."solutions"
    ADD CONSTRAINT "solutions_slug_unique" UNIQUE ("slug");



ALTER TABLE ONLY "public"."static_files"
    ADD CONSTRAINT "static_files_file_path_key" UNIQUE ("file_path");



ALTER TABLE ONLY "public"."static_files"
    ADD CONSTRAINT "static_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tech_stack_items"
    ADD CONSTRAINT "tech_stack_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."testimonial_settings"
    ADD CONSTRAINT "testimonial_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."translations"
    ADD CONSTRAINT "translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."translations"
    ADD CONSTRAINT "translations_translation_key_language_code_key" UNIQUE ("translation_key", "language_code");



ALTER TABLE ONLY "public"."typography_settings"
    ADD CONSTRAINT "typography_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."usps"
    ADD CONSTRAINT "usps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."video_sections"
    ADD CONSTRAINT "video_sections_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."video_sections"
    ADD CONSTRAINT "video_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."videos"
    ADD CONSTRAINT "videos_file_name_key" UNIQUE ("file_name");



ALTER TABLE ONLY "public"."videos"
    ADD CONSTRAINT "videos_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_activity_log_application_id" ON "public"."application_activity_log" USING "btree" ("application_id");



CREATE INDEX "idx_activity_log_created_at" ON "public"."application_activity_log" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_application_messages_application_id" ON "public"."application_messages" USING "btree" ("application_id");



CREATE INDEX "idx_application_messages_created_at" ON "public"."application_messages" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_application_messages_is_read" ON "public"."application_messages" USING "btree" ("is_read") WHERE ("is_read" = false);



CREATE INDEX "idx_background_styles_text_color" ON "public"."background_styles" USING "btree" ("text_color_class");



CREATE INDEX "idx_blog_posts_author_employee" ON "public"."blog_posts" USING "btree" ("author_employee_id");



CREATE INDEX "idx_blog_posts_category_id" ON "public"."blog_posts" USING "btree" ("category_id");



CREATE INDEX "idx_blog_posts_status_published_at" ON "public"."blog_posts" USING "btree" ("status", "published_at") WHERE ("status" = 'scheduled'::"text");



CREATE INDEX "idx_blog_tags_name" ON "public"."blog_tags" USING "btree" ("name");



CREATE INDEX "idx_business_hours_sort" ON "public"."business_hours" USING "btree" ("sort_order");



CREATE INDEX "idx_carousel_configs_name" ON "public"."carousel_configs" USING "btree" ("name");



CREATE INDEX "idx_color_tokens_active_type" ON "public"."color_tokens" USING "btree" ("active", "color_type", "category");



CREATE INDEX "idx_contact_items_sort" ON "public"."contact_items" USING "btree" ("sort_order");



CREATE INDEX "idx_email_logs_email_type" ON "public"."email_logs" USING "btree" ("email_type");



CREATE INDEX "idx_email_logs_related_id" ON "public"."email_logs" USING "btree" ("related_id");



CREATE INDEX "idx_email_logs_resend_id" ON "public"."email_logs" USING "btree" ("resend_id");



CREATE INDEX "idx_email_logs_sent_at" ON "public"."email_logs" USING "btree" ("sent_at" DESC);



CREATE INDEX "idx_email_logs_status" ON "public"."email_logs" USING "btree" ("status");



CREATE INDEX "idx_employees_section" ON "public"."employees" USING "btree" ("section");



CREATE INDEX "idx_employees_section_id" ON "public"."employees" USING "btree" ("section_id");



CREATE INDEX "idx_employees_sections_sort_order" ON "public"."employees_sections" USING "btree" ("sort_order");



CREATE INDEX "idx_employees_sort_order" ON "public"."employees" USING "btree" ("sort_order");



CREATE INDEX "idx_evaluation_batches_language" ON "public"."evaluation_batches" USING "btree" ("language_code");



CREATE INDEX "idx_evaluation_batches_status" ON "public"."evaluation_batches" USING "btree" ("language_code", "completed_at");



CREATE INDEX "idx_evaluation_progress_language" ON "public"."evaluation_progress" USING "btree" ("language_code");



CREATE INDEX "idx_evaluation_progress_status" ON "public"."evaluation_progress" USING "btree" ("status");



CREATE INDEX "idx_evaluation_scores_evaluation" ON "public"."evaluation_scores" USING "btree" ("evaluation_id");



CREATE INDEX "idx_evaluations_application" ON "public"."candidate_evaluations" USING "btree" ("application_id");



CREATE INDEX "idx_evaluations_evaluator" ON "public"."candidate_evaluations" USING "btree" ("evaluator_id");



CREATE INDEX "idx_features_section_id" ON "public"."features" USING "btree" ("section_id");



CREATE INDEX "idx_features_sort_order" ON "public"."features" USING "btree" ("sort_order");



CREATE INDEX "idx_image_carousel_settings_location" ON "public"."image_carousel_settings" USING "btree" ("location_id");



CREATE INDEX "idx_images_section_id" ON "public"."images" USING "btree" ("section_id");



CREATE INDEX "idx_interview_reminders_interview" ON "public"."interview_reminders" USING "btree" ("interview_id");



CREATE INDEX "idx_interview_reminders_pending" ON "public"."interview_reminders" USING "btree" ("scheduled_for") WHERE ("status" = 'pending'::"text");



CREATE INDEX "idx_interview_slots_available" ON "public"."interview_slots" USING "btree" ("start_time", "is_available") WHERE ("is_available" = true);



CREATE INDEX "idx_interview_slots_token" ON "public"."interview_slots" USING "btree" ("booking_token") WHERE ("booking_token" IS NOT NULL);



CREATE INDEX "idx_interviews_application" ON "public"."interviews" USING "btree" ("application_id");



CREATE INDEX "idx_interviews_scheduled_at" ON "public"."interviews" USING "btree" ("scheduled_at");



CREATE INDEX "idx_interviews_status" ON "public"."interviews" USING "btree" ("status");



CREATE INDEX "idx_job_applications_job_id" ON "public"."job_applications" USING "btree" ("job_id");



CREATE INDEX "idx_job_applications_status" ON "public"."job_applications" USING "btree" ("status");



CREATE INDEX "idx_job_applications_user_id" ON "public"."job_applications" USING "btree" ("user_id");



CREATE UNIQUE INDEX "idx_language_translation_stats_code" ON "public"."language_translation_stats" USING "btree" ("code");



CREATE INDEX "idx_lead_activities_lead_id" ON "public"."lead_activities" USING "btree" ("lead_id");



CREATE INDEX "idx_leads_status" ON "public"."leads" USING "btree" ("status");



CREATE INDEX "idx_page_meta_page_lang" ON "public"."page_meta_translations" USING "btree" ("page_slug", "language_code");



CREATE INDEX "idx_page_meta_quality" ON "public"."page_meta_translations" USING "btree" ("quality_score");



CREATE INDEX "idx_page_meta_review_status" ON "public"."page_meta_translations" USING "btree" ("review_status");



CREATE INDEX "idx_pricing_offers_lead_id" ON "public"."pricing_offers" USING "btree" ("lead_id");



CREATE INDEX "idx_pricing_offers_status" ON "public"."pricing_offers" USING "btree" ("status");



CREATE INDEX "idx_saved_jobs_job_id" ON "public"."saved_jobs" USING "btree" ("job_id");



CREATE INDEX "idx_saved_jobs_user_id" ON "public"."saved_jobs" USING "btree" ("user_id");



CREATE INDEX "idx_sections_page_location" ON "public"."sections" USING "btree" ("page_location");



CREATE INDEX "idx_sections_sort_order" ON "public"."sections" USING "btree" ("sort_order");



CREATE INDEX "idx_text_content_element_id" ON "public"."text_content" USING "btree" ("element_id");



CREATE UNIQUE INDEX "idx_text_content_element_id_unique" ON "public"."text_content" USING "btree" ("element_id") WHERE ("element_id" IS NOT NULL);



CREATE INDEX "idx_translations_approved" ON "public"."translations" USING "btree" ("approved");



CREATE INDEX "idx_translations_key" ON "public"."translations" USING "btree" ("translation_key");



CREATE INDEX "idx_translations_lang" ON "public"."translations" USING "btree" ("language_code");



CREATE INDEX "idx_translations_language_key" ON "public"."translations" USING "btree" ("language_code", "translation_key");



CREATE INDEX "idx_translations_language_quality" ON "public"."translations" USING "btree" ("language_code", "quality_score");



CREATE INDEX "idx_translations_page" ON "public"."translations" USING "btree" ("page_location");



CREATE INDEX "idx_translations_quality_score" ON "public"."translations" USING "btree" ("quality_score");



CREATE INDEX "idx_translations_review_status" ON "public"."translations" USING "btree" ("review_status");



CREATE INDEX "idx_usps_section_id" ON "public"."usps" USING "btree" ("section_id");



CREATE INDEX "idx_videos_section_sort" ON "public"."videos" USING "btree" ("section", "sort_order");



CREATE INDEX "solutions_slug_idx" ON "public"."solutions" USING "btree" ("slug");



CREATE INDEX "usps_active_location_sort_idx" ON "public"."usps" USING "btree" ("active", "location", "sort_order");



CREATE OR REPLACE TRIGGER "blog_post_category_count_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."blog_posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_blog_category_post_count"();



CREATE OR REPLACE TRIGGER "blog_post_tags_sync_trigger" AFTER INSERT OR UPDATE OF "tags" ON "public"."blog_posts" FOR EACH ROW EXECUTE FUNCTION "public"."sync_blog_post_tags"();



CREATE OR REPLACE TRIGGER "check_empty_approval" BEFORE INSERT OR UPDATE ON "public"."translations" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_empty_approval"();



CREATE OR REPLACE TRIGGER "check_unevaluated_approval" BEFORE INSERT OR UPDATE ON "public"."translations" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_unevaluated_approval"();



CREATE OR REPLACE TRIGGER "enforce_translation_key_hierarchy" BEFORE INSERT OR UPDATE ON "public"."translations" FOR EACH ROW EXECUTE FUNCTION "public"."check_translation_key_conflict"();



CREATE OR REPLACE TRIGGER "solution_slug_trigger" BEFORE INSERT OR UPDATE ON "public"."solutions" FOR EACH ROW EXECUTE FUNCTION "public"."auto_generate_solution_slug"();



CREATE OR REPLACE TRIGGER "sync_evaluation_on_quality_update" AFTER UPDATE OF "quality_score" ON "public"."translations" FOR EACH ROW EXECUTE FUNCTION "public"."sync_evaluation_progress"();



CREATE OR REPLACE TRIGGER "sync_evaluation_on_translation_change" AFTER INSERT OR DELETE OR UPDATE OF "quality_score" ON "public"."translations" FOR EACH ROW EXECUTE FUNCTION "public"."sync_evaluation_progress"();



CREATE OR REPLACE TRIGGER "sync_visibility_after_translation_change" AFTER INSERT OR DELETE OR UPDATE ON "public"."translations" FOR EACH STATEMENT EXECUTE FUNCTION "public"."trigger_sync_language_visibility"();



CREATE OR REPLACE TRIGGER "tr_flag_stale_translations" BEFORE UPDATE ON "public"."translations" FOR EACH ROW EXECUTE FUNCTION "public"."flag_stale_translations"();



CREATE OR REPLACE TRIGGER "tr_sync_new_translation_to_languages" AFTER INSERT ON "public"."translations" FOR EACH ROW EXECUTE FUNCTION "public"."sync_new_translation_to_languages"();



CREATE OR REPLACE TRIGGER "tr_sync_translation_styling" AFTER UPDATE ON "public"."translations" FOR EACH ROW EXECUTE FUNCTION "public"."sync_translation_styling"();



CREATE OR REPLACE TRIGGER "trg_update_video_sections_updated_at" BEFORE UPDATE ON "public"."video_sections" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_background_styles_updated_at" BEFORE UPDATE ON "public"."background_styles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_blog_categories_updated_at" BEFORE UPDATE ON "public"."blog_categories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_blog_posts_updated_at" BEFORE UPDATE ON "public"."blog_posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_brand_settings_updated_at" BEFORE UPDATE ON "public"."brand_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_business_hours_updated_at" BEFORE UPDATE ON "public"."business_hours" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_candidate_evaluations_updated_at" BEFORE UPDATE ON "public"."candidate_evaluations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_card_style_presets_updated_at" BEFORE UPDATE ON "public"."card_style_presets" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_carousel_configs_updated_at" BEFORE UPDATE ON "public"."carousel_configs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_color_tokens_updated_at" BEFORE UPDATE ON "public"."color_tokens" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_contact_items_updated_at" BEFORE UPDATE ON "public"."contact_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_contact_settings_updated_at" BEFORE UPDATE ON "public"."contact_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_content_hierarchies_updated_at" BEFORE UPDATE ON "public"."content_hierarchies" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_customer_stories_updated_at" BEFORE UPDATE ON "public"."customer_stories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_email_logs_updated_at" BEFORE UPDATE ON "public"."email_logs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_email_templates_updated_at" BEFORE UPDATE ON "public"."email_templates" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_employees_sections_updated_at" BEFORE UPDATE ON "public"."employees_sections" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_employees_settings_updated_at" BEFORE UPDATE ON "public"."employees_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_employees_updated_at" BEFORE UPDATE ON "public"."employees" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_evaluation_criteria_updated_at" BEFORE UPDATE ON "public"."evaluation_criteria" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_evaluation_progress_updated_at" BEFORE UPDATE ON "public"."evaluation_progress" FOR EACH ROW EXECUTE FUNCTION "public"."update_evaluation_progress_timestamp"();



CREATE OR REPLACE TRIGGER "update_faqs_updated_at" BEFORE UPDATE ON "public"."faqs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_features_settings_updated_at" BEFORE UPDATE ON "public"."features_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_features_updated_at" BEFORE UPDATE ON "public"."features" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_footer_settings_updated_at" BEFORE UPDATE ON "public"."footer_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_header_settings_updated_at" BEFORE UPDATE ON "public"."header_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_headings_updated_at" BEFORE UPDATE ON "public"."text_content" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_icon_styles_updated_at" BEFORE UPDATE ON "public"."icon_styles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_image_carousel_settings_updated_at" BEFORE UPDATE ON "public"."image_carousel_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_image_sections_updated_at" BEFORE UPDATE ON "public"."image_sections" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_images_updated_at" BEFORE UPDATE ON "public"."images" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_interview_slots_updated_at" BEFORE UPDATE ON "public"."interview_slots" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_interviews_updated_at" BEFORE UPDATE ON "public"."interviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_job_applications_updated_at" BEFORE UPDATE ON "public"."job_applications" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_job_listings_updated_at" BEFORE UPDATE ON "public"."job_listings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_language_settings_updated_at" BEFORE UPDATE ON "public"."language_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_languages_updated_at" BEFORE UPDATE ON "public"."languages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_leads_updated_at" BEFORE UPDATE ON "public"."leads" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_legal_documents_updated_at" BEFORE UPDATE ON "public"."legal_documents" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_page_meta_translations_updated_at" BEFORE UPDATE ON "public"."page_meta_translations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_pages_updated_at" BEFORE UPDATE ON "public"."pages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_press_mentions_updated_at" BEFORE UPDATE ON "public"."press_mentions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_pricing_offers_updated_at" BEFORE UPDATE ON "public"."pricing_offers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_pricing_scale_tiers_updated_at" BEFORE UPDATE ON "public"."pricing_scale_tiers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_pricing_tiers_config_updated_at" BEFORE UPDATE ON "public"."pricing_tiers_config" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_referral_sources_updated_at" BEFORE UPDATE ON "public"."referral_sources" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_rotating_headline_terms_updated_at" BEFORE UPDATE ON "public"."rotating_headline_terms" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_sales_contact_settings_updated_at" BEFORE UPDATE ON "public"."sales_contact_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_sections_updated_at" BEFORE UPDATE ON "public"."sections" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_site_settings_updated_at" BEFORE UPDATE ON "public"."site_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_slack_settings_updated_at" BEFORE UPDATE ON "public"."slack_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_solutions_settings_updated_at" BEFORE UPDATE ON "public"."solutions_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_solutions_updated_at" BEFORE UPDATE ON "public"."solutions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_static_files_updated_at" BEFORE UPDATE ON "public"."static_files" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_tech_stack_items_updated_at" BEFORE UPDATE ON "public"."tech_stack_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_translations_updated_at" BEFORE UPDATE ON "public"."translations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_typography_settings_updated_at" BEFORE UPDATE ON "public"."typography_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_usps_updated_at" BEFORE UPDATE ON "public"."usps" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_videos_updated_at" BEFORE UPDATE ON "public"."videos" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."application_activity_log"
    ADD CONSTRAINT "application_activity_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."application_activity_log"
    ADD CONSTRAINT "application_activity_log_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."job_applications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."application_messages"
    ADD CONSTRAINT "application_messages_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."job_applications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."availability_rules"
    ADD CONSTRAINT "availability_rules_team_member_id_fkey" FOREIGN KEY ("team_member_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_author_employee_id_fkey" FOREIGN KEY ("author_employee_id") REFERENCES "public"."employees"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."blog_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."booking_members"
    ADD CONSTRAINT "booking_members_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."booking_members"
    ADD CONSTRAINT "booking_members_team_member_id_fkey" FOREIGN KEY ("team_member_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_event_type_id_fkey" FOREIGN KEY ("event_type_id") REFERENCES "public"."event_types"("id");



ALTER TABLE ONLY "public"."candidate_evaluations"
    ADD CONSTRAINT "candidate_evaluations_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."job_applications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."candidate_evaluations"
    ADD CONSTRAINT "candidate_evaluations_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."content_hierarchies"
    ADD CONSTRAINT "content_hierarchies_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id");



ALTER TABLE ONLY "public"."content_hierarchies"
    ADD CONSTRAINT "content_hierarchies_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id");



ALTER TABLE ONLY "public"."evaluation_scores"
    ADD CONSTRAINT "evaluation_scores_criteria_id_fkey" FOREIGN KEY ("criteria_id") REFERENCES "public"."evaluation_criteria"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."evaluation_scores"
    ADD CONSTRAINT "evaluation_scores_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "public"."candidate_evaluations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_type_availability"
    ADD CONSTRAINT "event_type_availability_event_type_id_fkey" FOREIGN KEY ("event_type_id") REFERENCES "public"."event_types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_type_members"
    ADD CONSTRAINT "event_type_members_event_type_id_fkey" FOREIGN KEY ("event_type_id") REFERENCES "public"."event_types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_type_members"
    ADD CONSTRAINT "event_type_members_team_member_id_fkey" FOREIGN KEY ("team_member_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."features"
    ADD CONSTRAINT "features_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id");



ALTER TABLE ONLY "public"."google_oauth_tokens"
    ADD CONSTRAINT "google_oauth_tokens_team_member_id_fkey" FOREIGN KEY ("team_member_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."image_carousel_settings"
    ADD CONSTRAINT "image_carousel_settings_carousel_config_id_fkey" FOREIGN KEY ("carousel_config_id") REFERENCES "public"."carousel_configs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."image_carousel_settings"
    ADD CONSTRAINT "image_carousel_settings_saved_carousel_config_id_fkey" FOREIGN KEY ("saved_carousel_config_id") REFERENCES "public"."carousel_configs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."images"
    ADD CONSTRAINT "images_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id");



ALTER TABLE ONLY "public"."interview_reminders"
    ADD CONSTRAINT "interview_reminders_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_slots"
    ADD CONSTRAINT "interview_slots_booked_by_application_id_fkey" FOREIGN KEY ("booked_by_application_id") REFERENCES "public"."job_applications"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."interview_slots"
    ADD CONSTRAINT "interview_slots_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."job_listings"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."interviews"
    ADD CONSTRAINT "interviews_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."job_applications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_applications"
    ADD CONSTRAINT "job_applications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."job_listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_applications"
    ADD CONSTRAINT "job_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."language_settings"
    ADD CONSTRAINT "language_settings_default_language_code_fkey" FOREIGN KEY ("default_language_code") REFERENCES "public"."languages"("code");



ALTER TABLE ONLY "public"."language_settings"
    ADD CONSTRAINT "language_settings_fallback_language_code_fkey" FOREIGN KEY ("fallback_language_code") REFERENCES "public"."languages"("code");



ALTER TABLE ONLY "public"."lead_activities"
    ADD CONSTRAINT "lead_activities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."lead_activities"
    ADD CONSTRAINT "lead_activities_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."pricing_offers"
    ADD CONSTRAINT "pricing_offers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."pricing_offers"
    ADD CONSTRAINT "pricing_offers_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."sales_contact_settings"
    ADD CONSTRAINT "sales_contact_settings_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."saved_jobs"
    ADD CONSTRAINT "saved_jobs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."job_listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_jobs"
    ADD CONSTRAINT "saved_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sections"
    ADD CONSTRAINT "sections_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id");



ALTER TABLE ONLY "public"."testimonial_settings"
    ADD CONSTRAINT "testimonial_settings_customer_story_id_fkey" FOREIGN KEY ("customer_story_id") REFERENCES "public"."customer_stories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."translations"
    ADD CONSTRAINT "translations_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."translations"
    ADD CONSTRAINT "translations_language_code_fkey" FOREIGN KEY ("language_code") REFERENCES "public"."languages"("code") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usps"
    ADD CONSTRAINT "usps_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id");



CREATE POLICY "Admins and editors can manage offers" ON "public"."pricing_offers" TO "authenticated" USING (("public"."get_user_role"("auth"."uid"()) = ANY (ARRAY['admin'::"public"."app_role", 'editor'::"public"."app_role"]))) WITH CHECK (("public"."get_user_role"("auth"."uid"()) = ANY (ARRAY['admin'::"public"."app_role", 'editor'::"public"."app_role"])));



CREATE POLICY "Admins can delete slack settings" ON "public"."slack_settings" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "Admins can delete slots" ON "public"."interview_slots" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins can insert email logs" ON "public"."email_logs" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can insert slack settings" ON "public"."slack_settings" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can insert slots" ON "public"."interview_slots" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage FAQs" ON "public"."faqs" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage USPs" ON "public"."usps" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage all evaluations" ON "public"."candidate_evaluations" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Admins can manage all interviews" ON "public"."interviews" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Admins can manage all messages" ON "public"."application_messages" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage all scores" ON "public"."evaluation_scores" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Admins can manage background styles" ON "public"."background_styles" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage blog categories" ON "public"."blog_categories" USING ("public"."is_admin"());



CREATE POLICY "Admins can manage blog posts" ON "public"."blog_posts" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage blog tags" ON "public"."blog_tags" USING ("public"."is_admin"());



CREATE POLICY "Admins can manage brand settings" ON "public"."brand_settings" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage business hours" ON "public"."business_hours" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage card style presets" ON "public"."card_style_presets" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage carousel configs" ON "public"."carousel_configs" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage color tokens" ON "public"."color_tokens" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage contact items" ON "public"."contact_items" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage contact settings" ON "public"."contact_settings" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage content hierarchies" ON "public"."content_hierarchies" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage employees" ON "public"."employees" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage employees sections" ON "public"."employees_sections" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage employees settings" ON "public"."employees_settings" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage evaluation batches" ON "public"."evaluation_batches" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage evaluation criteria" ON "public"."evaluation_criteria" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Admins can manage evaluation progress" ON "public"."evaluation_progress" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage features" ON "public"."features" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage features settings" ON "public"."features_settings" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage footer settings" ON "public"."footer_settings" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage header settings" ON "public"."header_settings" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage icon styles" ON "public"."icon_styles" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage image carousel settings" ON "public"."image_carousel_settings" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage image sections" ON "public"."image_sections" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage images" ON "public"."images" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage interview reminders" ON "public"."interview_reminders" USING ("public"."is_admin"());



CREATE POLICY "Admins can manage jobs" ON "public"."job_listings" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage language settings" ON "public"."language_settings" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage languages" ON "public"."languages" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage lead activities" ON "public"."lead_activities" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = ANY (ARRAY['admin'::"public"."app_role", 'editor'::"public"."app_role"]))))));



CREATE POLICY "Admins can manage leads" ON "public"."leads" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = ANY (ARRAY['admin'::"public"."app_role", 'editor'::"public"."app_role"]))))));



CREATE POLICY "Admins can manage legal documents" ON "public"."legal_documents" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage page meta translations" ON "public"."page_meta_translations" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage pages" ON "public"."pages" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage press mentions" ON "public"."press_mentions" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage pricing config" ON "public"."pricing_tiers_config" USING ("public"."is_admin"());



CREATE POLICY "Admins can manage referral sources" ON "public"."referral_sources" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage roles" ON "public"."user_roles" TO "authenticated" USING (("public"."get_user_role"("auth"."uid"()) = 'admin'::"public"."app_role")) WITH CHECK (("public"."get_user_role"("auth"."uid"()) = 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage rotating headline terms" ON "public"."rotating_headline_terms" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage sales contact settings" ON "public"."sales_contact_settings" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = ANY (ARRAY['admin'::"public"."app_role", 'editor'::"public"."app_role"]))))));



CREATE POLICY "Admins can manage scale tiers" ON "public"."pricing_scale_tiers" USING ("public"."is_admin"());



CREATE POLICY "Admins can manage sections" ON "public"."sections" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage site settings" ON "public"."site_settings" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage solutions" ON "public"."solutions" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage solutions settings" ON "public"."solutions_settings" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage static files" ON "public"."static_files" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage stories" ON "public"."customer_stories" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage subscribers" ON "public"."newsletter_subscribers" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage tech stack items" ON "public"."tech_stack_items" USING ("public"."is_admin"());



CREATE POLICY "Admins can manage testimonial settings" ON "public"."testimonial_settings" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage text content" ON "public"."text_content" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage translations" ON "public"."translations" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage typography settings" ON "public"."typography_settings" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage video sections" ON "public"."video_sections" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage videos" ON "public"."videos" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can update all applications" ON "public"."job_applications" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Admins can update email logs" ON "public"."email_logs" FOR UPDATE USING ("public"."is_admin"());



CREATE POLICY "Admins can update slack settings" ON "public"."slack_settings" FOR UPDATE USING ("public"."is_admin"());



CREATE POLICY "Admins can update slots" ON "public"."interview_slots" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can view activity" ON "public"."application_activity_log" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admins can view email logs" ON "public"."email_logs" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admins can view slack settings" ON "public"."slack_settings" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admins can view subscribers" ON "public"."newsletter_subscribers" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admins manage availability" ON "public"."availability_rules" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins manage bookings" ON "public"."bookings" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins manage event type availability" ON "public"."event_type_availability" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins manage event type members" ON "public"."event_type_members" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins manage event types" ON "public"."event_types" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins manage oauth tokens" ON "public"."google_oauth_tokens" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins or interviewer can view reminders" ON "public"."interview_reminders" FOR SELECT TO "authenticated" USING (("public"."is_admin"() OR ("interviewer_id" = "auth"."uid"())));



CREATE POLICY "Admins view booking members" ON "public"."booking_members" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Allow insert activity" ON "public"."application_activity_log" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anon can view bookable employees" ON "public"."employees" FOR SELECT TO "anon" USING ((("active" = true) AND ("google_calendar_connected" = true)));



CREATE POLICY "Anyone can read active blog categories" ON "public"."blog_categories" FOR SELECT USING (("active" = true));



CREATE POLICY "Anyone can read blog tags" ON "public"."blog_tags" FOR SELECT USING (true);



CREATE POLICY "Anyone can subscribe" ON "public"."newsletter_subscribers" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can view active referral sources" ON "public"."referral_sources" FOR SELECT USING (true);



CREATE POLICY "Anyone can view available slots with valid token" ON "public"."interview_slots" FOR SELECT USING (true);



CREATE POLICY "Anyone can view offer by token" ON "public"."pricing_offers" FOR SELECT USING (true);



CREATE POLICY "Anyone can view pricing config" ON "public"."pricing_tiers_config" FOR SELECT USING (true);



CREATE POLICY "Anyone can view published legal documents" ON "public"."legal_documents" FOR SELECT USING (("published" = true));



CREATE POLICY "Anyone can view scale tiers" ON "public"."pricing_scale_tiers" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can view active criteria" ON "public"."evaluation_criteria" FOR SELECT USING ((("active" = true) AND ("auth"."uid"() IS NOT NULL)));



CREATE POLICY "Background styles are viewable by everyone" ON "public"."background_styles" FOR SELECT USING (true);



CREATE POLICY "Brand settings are viewable by everyone" ON "public"."brand_settings" FOR SELECT USING (true);



CREATE POLICY "Business hours are viewable by everyone" ON "public"."business_hours" FOR SELECT USING (true);



CREATE POLICY "Candidates can book via valid token" ON "public"."interview_slots" FOR UPDATE TO "anon", "authenticated" USING ((("booking_token" IS NOT NULL) AND ("is_available" = true))) WITH CHECK (("is_available" = false));



CREATE POLICY "Candidates can read own messages" ON "public"."application_messages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."job_applications" "ja"
  WHERE (("ja"."id" = "application_messages"."application_id") AND ("ja"."user_id" = "auth"."uid"())))));



CREATE POLICY "Candidates can send messages" ON "public"."application_messages" FOR INSERT WITH CHECK ((("sender_type" = 'candidate'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."job_applications" "ja"
  WHERE (("ja"."id" = "application_messages"."application_id") AND ("ja"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Card style presets are viewable by everyone" ON "public"."card_style_presets" FOR SELECT USING (true);



CREATE POLICY "Carousel configs are viewable by everyone" ON "public"."carousel_configs" FOR SELECT USING (true);



CREATE POLICY "Color tokens are viewable by everyone" ON "public"."color_tokens" FOR SELECT USING (true);



CREATE POLICY "Contact items are viewable by everyone" ON "public"."contact_items" FOR SELECT USING (true);



CREATE POLICY "Contact settings are viewable by everyone" ON "public"."contact_settings" FOR SELECT USING (true);



CREATE POLICY "Content hierarchies are viewable by everyone" ON "public"."content_hierarchies" FOR SELECT USING (true);



CREATE POLICY "Email templates are publicly readable" ON "public"."email_templates" FOR SELECT USING (true);



CREATE POLICY "Employees sections are viewable by everyone" ON "public"."employees_sections" FOR SELECT USING (true);



CREATE POLICY "Employees settings are viewable by everyone" ON "public"."employees_settings" FOR SELECT USING (true);



CREATE POLICY "Evaluation batches viewable by authenticated users" ON "public"."evaluation_batches" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Evaluation progress viewable by authenticated users" ON "public"."evaluation_progress" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Evaluators can create own evaluations" ON "public"."candidate_evaluations" FOR INSERT WITH CHECK (("evaluator_id" = "auth"."uid"()));



CREATE POLICY "Evaluators can manage own scores" ON "public"."evaluation_scores" USING ((EXISTS ( SELECT 1
   FROM "public"."candidate_evaluations" "ce"
  WHERE (("ce"."id" = "evaluation_scores"."evaluation_id") AND ("ce"."evaluator_id" = "auth"."uid"())))));



CREATE POLICY "Evaluators can update own evaluations" ON "public"."candidate_evaluations" FOR UPDATE USING (("evaluator_id" = "auth"."uid"()));



CREATE POLICY "Evaluators can view own evaluations" ON "public"."candidate_evaluations" FOR SELECT USING (("evaluator_id" = "auth"."uid"()));



CREATE POLICY "FAQs are viewable by everyone" ON "public"."faqs" FOR SELECT USING (("active" = true));



CREATE POLICY "Features are viewable by everyone" ON "public"."features" FOR SELECT USING (true);



CREATE POLICY "Features settings are viewable by everyone" ON "public"."features_settings" FOR SELECT USING (true);



CREATE POLICY "Footer settings are viewable by everyone" ON "public"."footer_settings" FOR SELECT USING (true);



CREATE POLICY "Header settings are viewable by everyone" ON "public"."header_settings" FOR SELECT USING (true);



CREATE POLICY "Headings are viewable by everyone" ON "public"."text_content" FOR SELECT USING (true);



CREATE POLICY "Icon styles viewable by everyone" ON "public"."icon_styles" FOR SELECT USING (true);



CREATE POLICY "Image carousel settings are viewable by everyone" ON "public"."image_carousel_settings" FOR SELECT USING (true);



CREATE POLICY "Image sections are viewable by everyone" ON "public"."image_sections" FOR SELECT USING (true);



CREATE POLICY "Images are viewable by everyone" ON "public"."images" FOR SELECT USING (true);



CREATE POLICY "Interviewers can view their interviews" ON "public"."interviews" FOR SELECT USING (("auth"."uid"() = ANY ("interviewer_ids")));



CREATE POLICY "Language settings are viewable by everyone" ON "public"."language_settings" FOR SELECT USING (true);



CREATE POLICY "Languages are viewable by everyone" ON "public"."languages" FOR SELECT USING (true);



CREATE POLICY "Only admins can delete email templates" ON "public"."email_templates" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "Only admins can insert email templates" ON "public"."email_templates" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "Only admins can update email templates" ON "public"."email_templates" FOR UPDATE USING ("public"."is_admin"());



CREATE POLICY "Page meta translations are viewable by everyone" ON "public"."page_meta_translations" FOR SELECT USING (true);



CREATE POLICY "Pages are viewable by everyone" ON "public"."pages" FOR SELECT USING (true);



CREATE POLICY "Public can create booking members" ON "public"."booking_members" FOR INSERT TO "anon", "authenticated" WITH CHECK (true);



CREATE POLICY "Public can create bookings" ON "public"."bookings" FOR INSERT TO "anon", "authenticated" WITH CHECK (true);



CREATE POLICY "Public can view active jobs" ON "public"."job_listings" FOR SELECT USING ((("active" = true) AND (("expires_at" IS NULL) OR ("expires_at" > "now"()))));



CREATE POLICY "Public can view active press mentions" ON "public"."press_mentions" FOR SELECT USING (("active" = true));



CREATE POLICY "Public can view availability" ON "public"."availability_rules" FOR SELECT TO "anon", "authenticated" USING (true);



CREATE POLICY "Public can view event type availability" ON "public"."event_type_availability" FOR SELECT TO "anon", "authenticated" USING (true);



CREATE POLICY "Public can view event type members" ON "public"."event_type_members" FOR SELECT TO "anon", "authenticated" USING (true);



CREATE POLICY "Public can view event types" ON "public"."event_types" FOR SELECT TO "anon", "authenticated" USING (true);



CREATE POLICY "Public can view non-sensitive employee data" ON "public"."employees" FOR SELECT USING (false);



CREATE POLICY "Public can view published blog posts" ON "public"."blog_posts" FOR SELECT USING ((("active" = true) AND (("published_at" IS NULL) OR ("published_at" <= "now"()))));



CREATE POLICY "Referral sources are viewable by everyone" ON "public"."referral_sources" FOR SELECT USING (true);



CREATE POLICY "Rotating headline terms viewable by everyone" ON "public"."rotating_headline_terms" FOR SELECT USING (true);



CREATE POLICY "Sales contact settings are publicly readable" ON "public"."sales_contact_settings" FOR SELECT USING (true);



CREATE POLICY "Sections are viewable by everyone" ON "public"."sections" FOR SELECT USING (true);



CREATE POLICY "Sections are viewable by everyone" ON "public"."video_sections" FOR SELECT USING (true);



CREATE POLICY "Service role can read slack settings" ON "public"."slack_settings" FOR SELECT USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role full access" ON "public"."email_logs" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Site settings are viewable by everyone" ON "public"."site_settings" FOR SELECT USING (true);



CREATE POLICY "Solutions are viewable by everyone" ON "public"."solutions" FOR SELECT USING (("active" = true));



CREATE POLICY "Solutions settings are viewable by everyone" ON "public"."solutions_settings" FOR SELECT USING (true);



CREATE POLICY "Static files are viewable by everyone" ON "public"."static_files" FOR SELECT USING (true);



CREATE POLICY "Stories are viewable by everyone" ON "public"."customer_stories" FOR SELECT USING (("active" = true));



CREATE POLICY "Tech stack items are publicly readable" ON "public"."tech_stack_items" FOR SELECT USING (true);



CREATE POLICY "Testimonial settings are viewable by everyone" ON "public"."testimonial_settings" FOR SELECT USING (true);



CREATE POLICY "Translations are viewable by everyone" ON "public"."translations" FOR SELECT USING (true);



CREATE POLICY "Typography settings are viewable by everyone" ON "public"."typography_settings" FOR SELECT USING (true);



CREATE POLICY "USPs are viewable by everyone" ON "public"."usps" FOR SELECT USING (true);



CREATE POLICY "Users can apply to jobs" ON "public"."job_applications" FOR INSERT WITH CHECK (((("auth"."uid"() IS NOT NULL) AND ("auth"."uid"() = "user_id")) OR (("auth"."uid"() IS NULL) AND ("user_id" IS NULL))));



CREATE POLICY "Users can save jobs" ON "public"."saved_jobs" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can unsave jobs" ON "public"."saved_jobs" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own applications" ON "public"."job_applications" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own applications" ON "public"."job_applications" FOR SELECT USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."app_role"))))));



CREATE POLICY "Users can view own role" ON "public"."user_roles" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own roles" ON "public"."user_roles" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own saved jobs" ON "public"."saved_jobs" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Videos are viewable by everyone" ON "public"."videos" FOR SELECT USING (true);



ALTER TABLE "public"."application_activity_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."application_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."availability_rules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."background_styles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blog_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blog_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blog_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."booking_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bookings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."brand_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."business_hours" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."candidate_evaluations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."card_style_presets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."carousel_configs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."color_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."content_hierarchies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customer_stories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."email_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."email_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employees" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employees_sections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employees_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."evaluation_batches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."evaluation_criteria" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."evaluation_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."evaluation_scores" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."event_type_availability" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."event_type_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."event_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."faqs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."features" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."features_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."footer_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."google_oauth_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."header_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."icon_styles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."image_carousel_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."image_sections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interview_reminders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interview_slots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."job_applications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."job_listings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."language_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."languages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lead_activities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."leads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."legal_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."newsletter_subscribers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."page_meta_translations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."press_mentions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pricing_offers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pricing_scale_tiers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pricing_tiers_config" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."referral_sources" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rotating_headline_terms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sales_contact_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."site_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."slack_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."solutions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."solutions_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."static_files" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tech_stack_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."testimonial_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."text_content" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."translations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."typography_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."usps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."video_sections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."videos" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_generate_solution_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_generate_solution_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_generate_solution_slug"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_translation_key_conflict"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_translation_key_conflict"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_translation_key_conflict"() TO "service_role";



GRANT ALL ON FUNCTION "public"."flag_stale_translations"() TO "anon";
GRANT ALL ON FUNCTION "public"."flag_stale_translations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."flag_stale_translations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_slug"("text_input" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_slug"("text_input" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_slug"("text_input" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role"("check_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role"("check_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role"("check_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "anon";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_empty_approval"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_empty_approval"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_empty_approval"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_unevaluated_approval"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_unevaluated_approval"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_unevaluated_approval"() TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_language_translation_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_language_translation_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_language_translation_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_blog_post_tags"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_blog_post_tags"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_blog_post_tags"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_evaluation_progress"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_evaluation_progress"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_evaluation_progress"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_language_visibility"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_language_visibility"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_language_visibility"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_new_translation_to_languages"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_new_translation_to_languages"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_new_translation_to_languages"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_translation_styling"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_translation_styling"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_translation_styling"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_sync_language_visibility"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_sync_language_visibility"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_sync_language_visibility"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_blog_category_post_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_blog_category_post_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_blog_category_post_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_evaluation_progress_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_evaluation_progress_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_evaluation_progress_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "public"."application_activity_log" TO "anon";
GRANT ALL ON TABLE "public"."application_activity_log" TO "authenticated";
GRANT ALL ON TABLE "public"."application_activity_log" TO "service_role";



GRANT ALL ON TABLE "public"."application_messages" TO "anon";
GRANT ALL ON TABLE "public"."application_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."application_messages" TO "service_role";



GRANT ALL ON TABLE "public"."availability_rules" TO "anon";
GRANT ALL ON TABLE "public"."availability_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."availability_rules" TO "service_role";



GRANT ALL ON TABLE "public"."background_styles" TO "anon";
GRANT ALL ON TABLE "public"."background_styles" TO "authenticated";
GRANT ALL ON TABLE "public"."background_styles" TO "service_role";



GRANT ALL ON TABLE "public"."blog_categories" TO "anon";
GRANT ALL ON TABLE "public"."blog_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."blog_categories" TO "service_role";



GRANT ALL ON TABLE "public"."blog_posts" TO "anon";
GRANT ALL ON TABLE "public"."blog_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."blog_posts" TO "service_role";



GRANT ALL ON TABLE "public"."blog_tags" TO "anon";
GRANT ALL ON TABLE "public"."blog_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."blog_tags" TO "service_role";



GRANT ALL ON TABLE "public"."booking_members" TO "anon";
GRANT ALL ON TABLE "public"."booking_members" TO "authenticated";
GRANT ALL ON TABLE "public"."booking_members" TO "service_role";



GRANT ALL ON TABLE "public"."bookings" TO "anon";
GRANT ALL ON TABLE "public"."bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."bookings" TO "service_role";



GRANT ALL ON TABLE "public"."brand_settings" TO "anon";
GRANT ALL ON TABLE "public"."brand_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."brand_settings" TO "service_role";



GRANT ALL ON TABLE "public"."business_hours" TO "anon";
GRANT ALL ON TABLE "public"."business_hours" TO "authenticated";
GRANT ALL ON TABLE "public"."business_hours" TO "service_role";



GRANT ALL ON TABLE "public"."candidate_evaluations" TO "anon";
GRANT ALL ON TABLE "public"."candidate_evaluations" TO "authenticated";
GRANT ALL ON TABLE "public"."candidate_evaluations" TO "service_role";



GRANT ALL ON TABLE "public"."card_style_presets" TO "anon";
GRANT ALL ON TABLE "public"."card_style_presets" TO "authenticated";
GRANT ALL ON TABLE "public"."card_style_presets" TO "service_role";



GRANT ALL ON TABLE "public"."carousel_configs" TO "anon";
GRANT ALL ON TABLE "public"."carousel_configs" TO "authenticated";
GRANT ALL ON TABLE "public"."carousel_configs" TO "service_role";



GRANT ALL ON TABLE "public"."color_tokens" TO "anon";
GRANT ALL ON TABLE "public"."color_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."color_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."contact_items" TO "anon";
GRANT ALL ON TABLE "public"."contact_items" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_items" TO "service_role";



GRANT ALL ON TABLE "public"."contact_settings" TO "anon";
GRANT ALL ON TABLE "public"."contact_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_settings" TO "service_role";



GRANT ALL ON TABLE "public"."content_hierarchies" TO "anon";
GRANT ALL ON TABLE "public"."content_hierarchies" TO "authenticated";
GRANT ALL ON TABLE "public"."content_hierarchies" TO "service_role";



GRANT ALL ON TABLE "public"."customer_stories" TO "anon";
GRANT ALL ON TABLE "public"."customer_stories" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_stories" TO "service_role";



GRANT ALL ON TABLE "public"."email_logs" TO "anon";
GRANT ALL ON TABLE "public"."email_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."email_logs" TO "service_role";



GRANT ALL ON TABLE "public"."email_templates" TO "anon";
GRANT ALL ON TABLE "public"."email_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."email_templates" TO "service_role";



GRANT ALL ON TABLE "public"."employees" TO "anon";
GRANT ALL ON TABLE "public"."employees" TO "authenticated";
GRANT ALL ON TABLE "public"."employees" TO "service_role";



GRANT ALL ON TABLE "public"."employees_public" TO "anon";
GRANT ALL ON TABLE "public"."employees_public" TO "authenticated";
GRANT ALL ON TABLE "public"."employees_public" TO "service_role";



GRANT ALL ON TABLE "public"."employees_sections" TO "anon";
GRANT ALL ON TABLE "public"."employees_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."employees_sections" TO "service_role";



GRANT ALL ON TABLE "public"."employees_settings" TO "anon";
GRANT ALL ON TABLE "public"."employees_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."employees_settings" TO "service_role";



GRANT ALL ON TABLE "public"."translations" TO "anon";
GRANT ALL ON TABLE "public"."translations" TO "authenticated";
GRANT ALL ON TABLE "public"."translations" TO "service_role";



GRANT ALL ON TABLE "public"."evaluated_counts_by_language" TO "anon";
GRANT ALL ON TABLE "public"."evaluated_counts_by_language" TO "authenticated";
GRANT ALL ON TABLE "public"."evaluated_counts_by_language" TO "service_role";



GRANT ALL ON TABLE "public"."evaluation_batches" TO "anon";
GRANT ALL ON TABLE "public"."evaluation_batches" TO "authenticated";
GRANT ALL ON TABLE "public"."evaluation_batches" TO "service_role";



GRANT ALL ON TABLE "public"."evaluation_criteria" TO "anon";
GRANT ALL ON TABLE "public"."evaluation_criteria" TO "authenticated";
GRANT ALL ON TABLE "public"."evaluation_criteria" TO "service_role";



GRANT ALL ON TABLE "public"."evaluation_progress" TO "anon";
GRANT ALL ON TABLE "public"."evaluation_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."evaluation_progress" TO "service_role";



GRANT ALL ON TABLE "public"."evaluation_scores" TO "anon";
GRANT ALL ON TABLE "public"."evaluation_scores" TO "authenticated";
GRANT ALL ON TABLE "public"."evaluation_scores" TO "service_role";



GRANT ALL ON TABLE "public"."event_type_availability" TO "anon";
GRANT ALL ON TABLE "public"."event_type_availability" TO "authenticated";
GRANT ALL ON TABLE "public"."event_type_availability" TO "service_role";



GRANT ALL ON TABLE "public"."event_type_members" TO "anon";
GRANT ALL ON TABLE "public"."event_type_members" TO "authenticated";
GRANT ALL ON TABLE "public"."event_type_members" TO "service_role";



GRANT ALL ON TABLE "public"."event_types" TO "anon";
GRANT ALL ON TABLE "public"."event_types" TO "authenticated";
GRANT ALL ON TABLE "public"."event_types" TO "service_role";



GRANT ALL ON TABLE "public"."faqs" TO "anon";
GRANT ALL ON TABLE "public"."faqs" TO "authenticated";
GRANT ALL ON TABLE "public"."faqs" TO "service_role";



GRANT ALL ON TABLE "public"."features" TO "anon";
GRANT ALL ON TABLE "public"."features" TO "authenticated";
GRANT ALL ON TABLE "public"."features" TO "service_role";



GRANT ALL ON TABLE "public"."features_settings" TO "anon";
GRANT ALL ON TABLE "public"."features_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."features_settings" TO "service_role";



GRANT ALL ON TABLE "public"."footer_settings" TO "anon";
GRANT ALL ON TABLE "public"."footer_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."footer_settings" TO "service_role";



GRANT ALL ON TABLE "public"."google_oauth_tokens" TO "anon";
GRANT ALL ON TABLE "public"."google_oauth_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."google_oauth_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."header_settings" TO "anon";
GRANT ALL ON TABLE "public"."header_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."header_settings" TO "service_role";



GRANT ALL ON TABLE "public"."icon_styles" TO "anon";
GRANT ALL ON TABLE "public"."icon_styles" TO "authenticated";
GRANT ALL ON TABLE "public"."icon_styles" TO "service_role";



GRANT ALL ON TABLE "public"."image_carousel_settings" TO "anon";
GRANT ALL ON TABLE "public"."image_carousel_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."image_carousel_settings" TO "service_role";



GRANT ALL ON TABLE "public"."image_sections" TO "anon";
GRANT ALL ON TABLE "public"."image_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."image_sections" TO "service_role";



GRANT ALL ON TABLE "public"."images" TO "anon";
GRANT ALL ON TABLE "public"."images" TO "authenticated";
GRANT ALL ON TABLE "public"."images" TO "service_role";



GRANT ALL ON TABLE "public"."interview_reminders" TO "anon";
GRANT ALL ON TABLE "public"."interview_reminders" TO "authenticated";
GRANT ALL ON TABLE "public"."interview_reminders" TO "service_role";



GRANT ALL ON TABLE "public"."interview_slots" TO "anon";
GRANT ALL ON TABLE "public"."interview_slots" TO "authenticated";
GRANT ALL ON TABLE "public"."interview_slots" TO "service_role";



GRANT ALL ON TABLE "public"."interviews" TO "anon";
GRANT ALL ON TABLE "public"."interviews" TO "authenticated";
GRANT ALL ON TABLE "public"."interviews" TO "service_role";



GRANT ALL ON TABLE "public"."job_applications" TO "anon";
GRANT ALL ON TABLE "public"."job_applications" TO "authenticated";
GRANT ALL ON TABLE "public"."job_applications" TO "service_role";



GRANT ALL ON TABLE "public"."job_listings" TO "anon";
GRANT ALL ON TABLE "public"."job_listings" TO "authenticated";
GRANT ALL ON TABLE "public"."job_listings" TO "service_role";



GRANT ALL ON TABLE "public"."language_settings" TO "anon";
GRANT ALL ON TABLE "public"."language_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."language_settings" TO "service_role";



GRANT ALL ON TABLE "public"."languages" TO "anon";
GRANT ALL ON TABLE "public"."languages" TO "authenticated";
GRANT ALL ON TABLE "public"."languages" TO "service_role";



GRANT ALL ON TABLE "public"."language_translation_stats" TO "service_role";
GRANT SELECT ON TABLE "public"."language_translation_stats" TO "authenticated";



GRANT ALL ON TABLE "public"."lead_activities" TO "anon";
GRANT ALL ON TABLE "public"."lead_activities" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_activities" TO "service_role";



GRANT ALL ON TABLE "public"."leads" TO "anon";
GRANT ALL ON TABLE "public"."leads" TO "authenticated";
GRANT ALL ON TABLE "public"."leads" TO "service_role";



GRANT ALL ON TABLE "public"."legal_documents" TO "anon";
GRANT ALL ON TABLE "public"."legal_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."legal_documents" TO "service_role";



GRANT ALL ON TABLE "public"."live_translation_stats" TO "anon";
GRANT ALL ON TABLE "public"."live_translation_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."live_translation_stats" TO "service_role";



GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "anon";
GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "authenticated";
GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "service_role";



GRANT ALL ON TABLE "public"."page_meta_translations" TO "anon";
GRANT ALL ON TABLE "public"."page_meta_translations" TO "authenticated";
GRANT ALL ON TABLE "public"."page_meta_translations" TO "service_role";



GRANT ALL ON TABLE "public"."pages" TO "anon";
GRANT ALL ON TABLE "public"."pages" TO "authenticated";
GRANT ALL ON TABLE "public"."pages" TO "service_role";



GRANT ALL ON TABLE "public"."page_meta_stats" TO "anon";
GRANT ALL ON TABLE "public"."page_meta_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."page_meta_stats" TO "service_role";



GRANT ALL ON TABLE "public"."press_mentions" TO "anon";
GRANT ALL ON TABLE "public"."press_mentions" TO "authenticated";
GRANT ALL ON TABLE "public"."press_mentions" TO "service_role";



GRANT ALL ON TABLE "public"."pricing_offers" TO "anon";
GRANT ALL ON TABLE "public"."pricing_offers" TO "authenticated";
GRANT ALL ON TABLE "public"."pricing_offers" TO "service_role";



GRANT ALL ON TABLE "public"."pricing_scale_tiers" TO "anon";
GRANT ALL ON TABLE "public"."pricing_scale_tiers" TO "authenticated";
GRANT ALL ON TABLE "public"."pricing_scale_tiers" TO "service_role";



GRANT ALL ON TABLE "public"."pricing_tiers_config" TO "anon";
GRANT ALL ON TABLE "public"."pricing_tiers_config" TO "authenticated";
GRANT ALL ON TABLE "public"."pricing_tiers_config" TO "service_role";



GRANT ALL ON TABLE "public"."public_employees" TO "anon";
GRANT ALL ON TABLE "public"."public_employees" TO "authenticated";
GRANT ALL ON TABLE "public"."public_employees" TO "service_role";



GRANT ALL ON TABLE "public"."referral_sources" TO "anon";
GRANT ALL ON TABLE "public"."referral_sources" TO "authenticated";
GRANT ALL ON TABLE "public"."referral_sources" TO "service_role";



GRANT ALL ON TABLE "public"."rotating_headline_terms" TO "anon";
GRANT ALL ON TABLE "public"."rotating_headline_terms" TO "authenticated";
GRANT ALL ON TABLE "public"."rotating_headline_terms" TO "service_role";



GRANT ALL ON TABLE "public"."sales_contact_settings" TO "anon";
GRANT ALL ON TABLE "public"."sales_contact_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."sales_contact_settings" TO "service_role";



GRANT ALL ON TABLE "public"."saved_jobs" TO "anon";
GRANT ALL ON TABLE "public"."saved_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."sections" TO "anon";
GRANT ALL ON TABLE "public"."sections" TO "authenticated";
GRANT ALL ON TABLE "public"."sections" TO "service_role";



GRANT ALL ON TABLE "public"."site_settings" TO "anon";
GRANT ALL ON TABLE "public"."site_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."site_settings" TO "service_role";



GRANT ALL ON TABLE "public"."slack_settings" TO "anon";
GRANT ALL ON TABLE "public"."slack_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."slack_settings" TO "service_role";



GRANT ALL ON TABLE "public"."solutions" TO "anon";
GRANT ALL ON TABLE "public"."solutions" TO "authenticated";
GRANT ALL ON TABLE "public"."solutions" TO "service_role";



GRANT ALL ON TABLE "public"."solutions_settings" TO "anon";
GRANT ALL ON TABLE "public"."solutions_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."solutions_settings" TO "service_role";



GRANT ALL ON TABLE "public"."static_files" TO "anon";
GRANT ALL ON TABLE "public"."static_files" TO "authenticated";
GRANT ALL ON TABLE "public"."static_files" TO "service_role";



GRANT ALL ON TABLE "public"."tech_stack_items" TO "anon";
GRANT ALL ON TABLE "public"."tech_stack_items" TO "authenticated";
GRANT ALL ON TABLE "public"."tech_stack_items" TO "service_role";



GRANT ALL ON TABLE "public"."testimonial_settings" TO "anon";
GRANT ALL ON TABLE "public"."testimonial_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."testimonial_settings" TO "service_role";



GRANT ALL ON TABLE "public"."text_content" TO "anon";
GRANT ALL ON TABLE "public"."text_content" TO "authenticated";
GRANT ALL ON TABLE "public"."text_content" TO "service_role";



GRANT ALL ON TABLE "public"."translation_stats" TO "anon";
GRANT ALL ON TABLE "public"."translation_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."translation_stats" TO "service_role";



GRANT ALL ON TABLE "public"."typography_settings" TO "anon";
GRANT ALL ON TABLE "public"."typography_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."typography_settings" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."usps" TO "anon";
GRANT ALL ON TABLE "public"."usps" TO "authenticated";
GRANT ALL ON TABLE "public"."usps" TO "service_role";



GRANT ALL ON TABLE "public"."video_sections" TO "anon";
GRANT ALL ON TABLE "public"."video_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."video_sections" TO "service_role";



GRANT ALL ON TABLE "public"."videos" TO "anon";
GRANT ALL ON TABLE "public"."videos" TO "authenticated";
GRANT ALL ON TABLE "public"."videos" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";








-- ---------------------------------------------------
-- Operational state: scheduled jobs (pg_cron)
-- ---------------------------------------------------
SELECT cron.schedule('publish-scheduled-blog-posts', '*/5 * * * *', $$
  UPDATE blog_posts
  SET status = 'published', active = true
  WHERE status = 'scheduled' AND published_at <= now();
$$);

COMMIT;
