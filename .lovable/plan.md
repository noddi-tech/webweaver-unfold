
# Translation System Overhaul: Comprehensive Wizard-Style UX Improvement Plan

## Executive Summary

Based on my analysis, the current translation system has:
- **682 English translation keys** (4 marked as intentionally empty)
- **~94-95 missing translations per language** (empty rows awaiting translation)
- **16 enabled languages** but only English is visible in the language switcher
- Complex, fragmented UI spread across multiple components with inconsistent workflows
- No wizard-style guided process for bulk operations

This plan creates a **streamlined, wizard-style Translation Command Center** that consolidates all translation operations into clear, sequential workflows.

---

## Current State Analysis

### Issues Identified

| Issue | Current State | Impact |
|-------|---------------|--------|
| Scattered UI | Operations spread across 5+ tabs and components | User confusion, missed steps |
| No guided workflow | Actions are isolated, no context linking | Users don't know what to do next |
| Missing English content | 4 keys with empty English source | Downstream translations cannot proceed |
| Empty translation rows | ~95 per language | Shows as "missing" in dashboard |
| Stale translations | ~95 per language marked stale | Need re-translation |
| Inconsistent progress tracking | evaluation_progress table out of sync | Confusing status indicators |

### Database State Summary

```text
Languages: 16 enabled (only English in switcher)
English: 678 actual / 682 total (4 empty - marked as intentionally empty)
Other Languages: ~587-604 actual translations each
Missing per language: 78-95 translations
Stale per language: ~95 translations
Evaluated: Only 5 languages fully evaluated
```

---

## Implementation Plan

### Phase 1: Translation Command Center Wizard (Primary Focus)

**Goal**: Create a single, wizard-style component that guides users through the complete translation workflow.

#### 1.1 Create New Component: `TranslationWizard.tsx`

A step-by-step wizard that:

1. **Step 1: English Source Health**
   - Show count of empty English keys (if any)
   - Provide "Add Content" links or "Mark as Intentional" options
   - Cannot proceed until English is 100% complete

2. **Step 2: Sync Translation Keys**
   - Show which languages are missing key entries
   - One-click "Sync All Keys" button
   - Progress indicator for sync operation

3. **Step 3: Translate Missing Content**
   - Visual language cards with translation progress
   - Multi-select languages for batch translation
   - Smart defaults: suggest languages with most missing content first
   - Progress bar per language during translation

4. **Step 4: Quality Evaluation**
   - Show evaluation status per language
   - Batch evaluation with progress tracking
   - Quality score summary after completion

5. **Step 5: Approval & Publishing**
   - Auto-approve high-quality translations (≥85%)
   - Review low-quality translations (<70%)
   - Toggle language visibility in switcher

#### Files to Create/Modify:

| File | Action | Description |
|------|--------|-------------|
| `src/components/design-system/TranslationWizard.tsx` | Create | Main wizard component with step navigation |
| `src/components/design-system/WizardStepEnglish.tsx` | Create | Step 1: English source health |
| `src/components/design-system/WizardStepSync.tsx` | Create | Step 2: Key synchronization |
| `src/components/design-system/WizardStepTranslate.tsx` | Create | Step 3: Batch translation |
| `src/components/design-system/WizardStepEvaluate.tsx` | Create | Step 4: Quality evaluation |
| `src/components/design-system/WizardStepApprove.tsx` | Create | Step 5: Approval and visibility |
| `src/pages/TranslationManager.tsx` | Modify | Add Wizard tab to main navigation |

---

### Phase 2: Quick Actions Dashboard

**Goal**: Provide one-click fixes for common issues directly from the Overview tab.

#### 2.1 Enhance `TranslationHealthCheck.tsx`

Add contextual action buttons:

| Issue Type | Quick Action |
|------------|--------------|
| Missing Translations | "Translate All Missing" button with language picker |
| Stale Translations | "Update Stale" button (already exists, improve UX) |
| Unevaluated | "Evaluate All" with progress indicator |
| Low Quality (<70%) | "Refine Low Quality" batch operation |

#### 2.2 Add "Fix This Language" Dropdown

Per-language quick actions in `LanguageStatsTable.tsx`:
- Translate missing → Evaluate → Auto-approve (one-click workflow)
- Show estimated time for operations

#### Files to Modify:

| File | Changes |
|------|---------|
| `src/components/design-system/TranslationHealthCheck.tsx` | Add per-issue quick action buttons |
| `src/components/design-system/LanguageStatsTable.tsx` | Add dropdown menu with per-language actions |

---

### Phase 3: Improved Progress Tracking

**Goal**: Accurate, real-time progress indicators that reflect actual database state.

#### 3.1 Fix Evaluation Progress Sync

The `evaluation_progress` table counters become stale. Implement:

- Query actual `translations.quality_score IS NOT NULL` count instead of cached counter
- Real-time subscription to translations table changes
- Auto-refresh on any translation update

#### 3.2 Add Translation Pipeline Progress View

New component showing translation flow:

```text
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  English    │ →  │  Synced     │ →  │ Translated  │ →  │  Approved   │
│  682 keys   │    │  9,793/10,192 │    │  8,961      │    │  1,266      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

#### Files to Modify:

| File | Changes |
|------|---------|
| `src/hooks/useTranslationStats.ts` | Add real-time subscriptions, query actual DB counts |
| `src/components/design-system/UnifiedDashboard.tsx` | Add pipeline visualization |

---

### Phase 4: One-Click "Fix All" Workflow

**Goal**: Single button to resolve all translation issues in correct sequence.

#### 4.1 Smart "Fix All" Sequence

```text
1. Sync missing translation key entries (create empty rows)
2. Translate all empty translations (batch by language)
3. Evaluate all unevaluated translations
4. Auto-approve translations with score ≥ 85%
5. Update language visibility based on approval rate
```

#### 4.2 Implementation

Create a new edge function `sync-and-translate` that:
- Orchestrates the full pipeline
- Returns progress updates via streaming or polling
- Handles partial failures gracefully

#### Files to Create/Modify:

| File | Action |
|------|--------|
| `supabase/functions/sync-and-translate/index.ts` | Create orchestration function |
| `src/components/design-system/FixAllButton.tsx` | Create with progress modal |

---

### Phase 5: UX Polish & Consistency

**Goal**: Make the entire translation experience intuitive and consistent.

#### 5.1 Consolidate Duplicate UI

Currently, similar stats tables appear in multiple places:
- `UnifiedDashboard.tsx` → `LanguageStatsTable`
- `TranslationManagerContent.tsx` → `LanguageStatsTable`
- `TranslationHealthCheck.tsx` → Stats grid

**Action**: Create single source of truth component with consistent actions.

#### 5.2 Add Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+S` | Sync keys |
| `Cmd+T` | Translate selected |
| `Cmd+E` | Evaluate selected |
| `Cmd+A` | Approve high quality |

#### 5.3 Improve Feedback & Notifications

- Toast notifications with actionable "View Results" links
- Persistent progress bar during long operations
- Error recovery suggestions

---

## Technical Implementation Details

### New Components Architecture

```text
TranslationManager (Page)
├── TranslationWizard
│   ├── WizardProgress (step indicator)
│   ├── WizardStepEnglish
│   ├── WizardStepSync
│   ├── WizardStepTranslate
│   │   └── LanguageTranslationCard (per language)
│   ├── WizardStepEvaluate
│   │   └── EvaluationProgressCard
│   └── WizardStepApprove
│       └── ApprovalBatchPanel
├── TranslationHealthCheck (enhanced)
├── LanguageStatsTable (enhanced)
└── TranslationManagerContent (existing, simplified)
```

### Database Queries to Add

```sql
-- Create view for accurate translation stats per language
CREATE OR REPLACE VIEW live_translation_stats AS
SELECT 
  l.code,
  l.name,
  l.enabled,
  l.show_in_switcher,
  (SELECT COUNT(*) FROM translations WHERE language_code = 'en') as english_key_count,
  COUNT(t.id) as total_rows,
  COUNT(CASE WHEN t.translated_text IS NOT NULL AND t.translated_text != '' THEN 1 END) as actual_translations,
  COUNT(CASE WHEN t.translated_text IS NULL OR t.translated_text = '' THEN 1 END) as empty_count,
  COUNT(CASE WHEN t.is_stale = true THEN 1 END) as stale_count,
  COUNT(CASE WHEN t.approved = true THEN 1 END) as approved_count,
  COUNT(CASE WHEN t.quality_score IS NOT NULL THEN 1 END) as evaluated_count,
  AVG(t.quality_score) as avg_quality_score
FROM languages l
LEFT JOIN translations t ON t.language_code = l.code
WHERE l.enabled = true
GROUP BY l.code, l.name, l.enabled, l.show_in_switcher, l.sort_order
ORDER BY l.sort_order;
```

---

## Immediate Quick Fixes (Can Execute Now)

Before the full wizard implementation, these quick fixes address the immediate issues:

1. **Translate the 95 missing translations per language**
   - Use existing "Translate Missing" button in LanguageSelectionPanel
   - Or trigger via TranslationHealthCheck "Fix All"

2. **Re-sync evaluation progress counters**
   ```sql
   -- Update evaluation_progress with actual counts
   UPDATE evaluation_progress ep
   SET evaluated_keys = (
     SELECT COUNT(*) FROM translations t 
     WHERE t.language_code = ep.language_code 
     AND t.quality_score IS NOT NULL
   );
   ```

3. **Mark intentionally empty keys properly**
   - Already done for `how_it_works.step_*.details`

---

## Implementation Priority Order

| Priority | Phase | Estimated Effort | Impact |
|----------|-------|------------------|--------|
| 🔥 1 | Phase 4: One-Click Fix All | 2-3 hours | Immediate problem resolution |
| 🔥 2 | Phase 1: Translation Wizard | 4-6 hours | Long-term UX improvement |
| ⚡ 3 | Phase 2: Quick Actions | 2-3 hours | Enhanced usability |
| ⚡ 4 | Phase 3: Progress Tracking | 2-3 hours | Accurate status display |
| 📋 5 | Phase 5: UX Polish | 2-3 hours | Consistent experience |

---

## Summary of Files to Create/Modify

### New Files (8)
- `src/components/design-system/TranslationWizard.tsx`
- `src/components/design-system/WizardStepEnglish.tsx`
- `src/components/design-system/WizardStepSync.tsx`
- `src/components/design-system/WizardStepTranslate.tsx`
- `src/components/design-system/WizardStepEvaluate.tsx`
- `src/components/design-system/WizardStepApprove.tsx`
- `src/components/design-system/FixAllButton.tsx`
- `supabase/functions/sync-and-translate/index.ts`

### Existing Files to Modify (6)
- `src/pages/TranslationManager.tsx` - Add Wizard tab
- `src/components/design-system/TranslationHealthCheck.tsx` - Add quick actions
- `src/components/design-system/LanguageStatsTable.tsx` - Add per-row actions
- `src/components/design-system/UnifiedDashboard.tsx` - Add pipeline visualization
- `src/hooks/useTranslationStats.ts` - Add real-time subscriptions
- Database migration for `live_translation_stats` view

---

## Expected Outcomes

After implementation:

1. **Single guided workflow** for complete translation pipeline
2. **One-click resolution** of all translation issues
3. **Accurate progress tracking** reflecting real database state
4. **Consistent UX** across all translation management views
5. **Reduced cognitive load** with clear next steps at each stage
6. **Scalable architecture** for adding new content/languages automatically
