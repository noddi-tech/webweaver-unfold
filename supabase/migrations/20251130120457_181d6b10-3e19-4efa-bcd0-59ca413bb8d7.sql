-- Stop French evaluation in progress
UPDATE evaluation_progress 
SET status = 'idle', 
    updated_at = NOW()
WHERE language_code = 'fr';