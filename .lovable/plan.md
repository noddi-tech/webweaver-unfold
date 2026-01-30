

## Translation System Review & Scalability Improvements

### Current State Analysis

Based on my comprehensive review, here's what's happening:

---

### Issue 1: 4 Missing English Translations

**Root Cause**: These 4 keys exist but have empty text values:
- `how_it_works.step_1.details`
- `how_it_works.step_2.details`
- `how_it_works.step_3.details`
- `how_it_works.step_4.details`

**Solution**: Either:
1. Fill in the English content for these keys (if they should have content)
2. Mark them as "intentionally empty" using the `is_intentionally_empty` flag (if they're deliberately blank)

---

### Issue 2: 166 Missing Translations for Other Languages

**Root Cause**: The database trigger creates empty placeholder rows when English keys are inserted, but those placeholders were never translated.

**Timeline of gaps**:
- 88 translations created on Dec 4, 2025
- 78 translations created on Jan 7, 2026

**Solution**: Run "Translate Missing" or "Fix All" from the Translation Health Check to fill these gaps.

---

### Issue 3: Scalability - Auto-Adding Content

**Current architecture** (already in place):

```text
┌─────────────────────────────────────────────────────────────────┐
│                    NEW ENGLISH CONTENT                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  DATABASE TRIGGER: sync_new_translation_to_languages            │
│  - Fires on INSERT to translations table                        │
│  - Creates empty placeholders for all enabled languages         │
│  - Sets is_stale = true, review_status = 'needs_translation'    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  MANUAL STEP REQUIRED                                           │
│  Options:                                                       │
│  1. Enable "Auto-translate on edit" in site_settings            │
│  2. Click "Translate Missing" per language                      │
│  3. Click "Fix All" in Translation Health Check                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Recommended Improvements

#### Option A: Enable Auto-Translation Globally

Turn on the existing "Auto-translate on edit" feature so that whenever English content is saved, all languages are automatically translated.

**Files to modify**: None - just enable the setting in the CMS

#### Option B: Add Auto-Translation on Insert Trigger (New Feature)

Create a new database trigger + edge function that automatically translates new English content to all enabled languages immediately after insertion.

**Architecture**:

```text
NEW ENGLISH INSERT
       │
       ▼
┌────────────────────────────────────────────┐
│ Database Trigger: auto_translate_on_insert │
└────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────┐
│ pg_net HTTP call to translate-content      │
│ edge function (async, non-blocking)        │
└────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────┐
│ All enabled languages translated in        │
│ background within 30-60 seconds            │
└────────────────────────────────────────────┘
```

**Files to create/modify**:
- New migration to add `pg_net` extension and trigger
- Modify `translate-content` edge function to handle webhook calls

#### Option C: Scheduled Background Job (Most Robust)

Add a scheduled job that periodically checks for untranslated content and fills in gaps.

**Files to create**:
- New edge function: `sync-missing-translations`
- Cron job configuration in Supabase

---

### Immediate Actions

1. **Fill the 4 empty English translations** or mark them as intentionally empty
2. **Run "Fix All"** in Translation Health Check to translate the 166 missing translations
3. **Enable "Auto-translate on edit"** setting for future scalability

---

### Technical Details

**Existing infrastructure that's working**:
- Database trigger `sync_new_translation_to_languages` - creates placeholders
- Database trigger `flag_stale_translations` - marks translations as stale when English changes  
- Database trigger `sync_translation_styling` - syncs styling from English to other languages
- Edge function `translate-single-key` - translates individual keys
- Edge function `translate-content` - bulk translation
- Translation Health Check UI - shows broken/missing/stale counts

**What's missing**:
- Automatic translation on insert (only manual or "on edit" with setting enabled)

---

### Recommended Plan

| Step | Action | Effort |
|------|--------|--------|
| 1 | Fix the 4 empty English translations | 5 min |
| 2 | Run "Fix All" to translate 166 missing | 10 min (automated) |
| 3 | Enable "Auto-translate on edit" setting | 1 min |
| 4 | (Optional) Add auto-translate on insert trigger | 30 min dev |

