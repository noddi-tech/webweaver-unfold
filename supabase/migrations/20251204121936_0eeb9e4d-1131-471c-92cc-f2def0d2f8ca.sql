-- BULLETPROOF FIX: Accurate translation statistics and data integrity

-- Phase 1: Fix translation_stats view - only count approved IF has content
DROP VIEW IF EXISTS translation_stats;
CREATE VIEW translation_stats AS
SELECT 
    l.code,
    l.name,
    l.enabled,
    l.sort_order,
    count(t.id)::integer AS total_translations,
    count(CASE WHEN t.translated_text IS NOT NULL AND t.translated_text <> '' THEN 1 END)::integer AS actual_translations,
    count(CASE WHEN t.translated_text IS NULL OR t.translated_text = '' THEN 1 END)::integer AS missing_translations,
    -- FIX: Only count approved IF has content (prevents impossible counts like 568/564)
    count(CASE WHEN t.approved = true AND t.translated_text IS NOT NULL AND t.translated_text <> '' THEN 1 END)::integer AS approved_translations,
    -- Calculate percentage only from actual translations with content
    CASE WHEN count(CASE WHEN t.translated_text IS NOT NULL AND t.translated_text <> '' THEN 1 END) > 0 
        THEN round(
            count(CASE WHEN t.approved = true AND t.translated_text IS NOT NULL AND t.translated_text <> '' THEN 1 END)::numeric / 
            count(CASE WHEN t.translated_text IS NOT NULL AND t.translated_text <> '' THEN 1 END)::numeric * 100, 2
        )
        ELSE 0
    END AS approval_percentage,
    round(avg(t.quality_score), 2) AS avg_quality_score,
    count(CASE WHEN t.quality_score >= 85 THEN 1 END)::integer AS high_quality_count,
    count(CASE WHEN t.quality_score >= 70 AND t.quality_score < 85 THEN 1 END)::integer AS medium_quality_count,
    count(CASE WHEN t.quality_score < 70 AND t.quality_score >= 1 THEN 1 END)::integer AS low_quality_count,
    count(CASE WHEN t.review_status = 'needs_review' THEN 1 END)::integer AS needs_review_count
FROM languages l
LEFT JOIN translations t ON l.code = t.language_code
WHERE l.enabled = true
GROUP BY l.code, l.name, l.enabled, l.sort_order
ORDER BY l.sort_order;

-- Phase 2: Fix evaluated_counts_by_language view - use >= 1 for consistency with CHECK constraint
DROP VIEW IF EXISTS evaluated_counts_by_language;
CREATE VIEW evaluated_counts_by_language AS
SELECT 
    language_code,
    COUNT(*) FILTER (WHERE quality_score >= 1) AS evaluated_count,
    COUNT(*) AS total_count
FROM translations
WHERE language_code <> 'en'
GROUP BY language_code;

-- Phase 3: Add trigger to prevent approving empty translations (belt + suspenders)
CREATE OR REPLACE FUNCTION prevent_empty_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.approved = true AND (NEW.translated_text IS NULL OR NEW.translated_text = '') THEN
        -- Auto-reject approval of empty translations instead of failing
        NEW.approved := false;
        RAISE WARNING 'Cannot approve empty translation: %. Setting approved to false.', NEW.translation_key;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger (drop first if exists)
DROP TRIGGER IF EXISTS check_empty_approval ON translations;
CREATE TRIGGER check_empty_approval
    BEFORE INSERT OR UPDATE ON translations
    FOR EACH ROW
    EXECUTE FUNCTION prevent_empty_approval();

-- Phase 4: Clean up existing bad data - un-approve all empty translations
UPDATE translations 
SET approved = false, updated_at = now()
WHERE approved = true 
  AND (translated_text IS NULL OR translated_text = '');