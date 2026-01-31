

## Translation Pipeline Fix: Timeout and Progress Issues

### Root Cause Analysis

Based on my investigation:

| Issue | Cause | Evidence |
|-------|-------|----------|
| "0 synced" | All translation keys already exist as empty rows | Database shows 682 rows per language with 95 empty translations |
| Stuck at "Translate" | Edge function timeout (~150s limit) | Error: `FunctionsFetchError: Failed to send a request` / `context canceled` |

The `sync-and-translate` orchestrator calls `translate-content` for each of the 15 languages sequentially. Each language has ~95 translations and takes ~20 seconds. Total time: **15 × 20s = 300+ seconds** - far exceeding the timeout.

---

### Solution Architecture

Implement a **language-by-language processing pattern** with incremental progress updates:

```text
CURRENT (BROKEN):
┌─────────────────────────────────────────┐
│ sync-and-translate edge function        │
│ - Loops through 15 languages            │
│ - Calls translate-content for each      │
│ - Waits for all to complete             │
│ - TIMEOUT after ~150 seconds            │
└─────────────────────────────────────────┘

FIXED:
┌─────────────────────────────────────────┐
│ FixAllButton.tsx (frontend)             │
│ - Loops through languages one-by-one    │
│ - Calls translate-content directly      │
│ - Updates UI after each language        │
│ - Never times out                       │
└─────────────────────────────────────────┘
```

---

### Implementation Plan

#### Phase 1: Fix the FixAllButton to Process Languages Individually

Update `FixAllButton.tsx` to:

1. **Sync step**: Call `sync-and-translate` with `action: 'sync'` (fast, no timeout issue)
2. **Translate step**: Loop through each language in the frontend, calling `translate-content` directly for each language, updating progress after each
3. **Evaluate step**: Same approach - call `evaluate-translation-quality` per language
4. **Approve step**: Single database update (fast)

This ensures each API call completes within the timeout limit and provides real-time progress.

#### Phase 2: Add Per-Language Progress UI

Update the dialog to show:
- Current language being processed
- Languages completed vs total
- Translations completed per language
- Time estimates

#### Phase 3: Handle Partial Failures Gracefully

- If one language fails, continue with the next
- Show which languages succeeded/failed at the end
- Allow retry of failed languages only

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/design-system/FixAllButton.tsx` | Rewrite to process languages individually with progress tracking |
| `src/components/design-system/WizardStepTranslate.tsx` | Already has per-language UI - ensure it uses direct API calls |

---

### Technical Implementation Details

**FixAllButton.tsx - Key Changes:**

```typescript
// Instead of:
const { data } = await supabase.functions.invoke('sync-and-translate', {
  body: { action: 'translate' }  // Times out
});

// Use:
const { data: languages } = await supabase.from('languages')
  .select('code').eq('enabled', true).neq('code', 'en');

let totalTranslated = 0;
for (const lang of languages) {
  updateProgress(`Translating ${lang.code}...`);
  
  // Get empty translations for this language
  const { data: emptyKeys } = await supabase.from('translations')
    .select('translation_key')
    .eq('language_code', lang.code)
    .or('translated_text.is.null,translated_text.eq.');
  
  if (emptyKeys?.length > 0) {
    const { data } = await supabase.functions.invoke('translate-content', {
      body: { 
        translationKeys: emptyKeys.map(k => k.translation_key),
        targetLanguage: lang.code,
        sourceLanguage: 'en'
      }
    });
    totalTranslated += data?.translated || 0;
  }
}
```

---

### Expected Outcome

After implementation:

1. **No more timeouts** - each API call processes 1 language (under 150s)
2. **Real-time progress** - users see which language is processing
3. **Resilient to failures** - partial success is reported, failed languages can be retried
4. **Accurate counts** - translations completed shown per language

