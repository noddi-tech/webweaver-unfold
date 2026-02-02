

## Fix Evaluation Resume UI: Progress Visibility & Timeout Issues

### Root Cause

The "Resuming..." button spins indefinitely because:

1. **Sequential Processing with Long Timeouts**: The function waits for ALL 12 languages to complete before releasing the button, but each language takes ~90-150 seconds
2. **No Per-Language Progress Updates**: The UI doesn't show which language is currently being processed
3. **Real-time Subscription Not Triggering Refreshes**: The dashboard doesn't visually update as evaluations progress

**Good news**: The backend IS working - the edge function logs show evaluations completing successfully. The issue is purely UI/UX.

### Solution Architecture

```text
CURRENT (BROKEN):
┌─────────────────────────────────────┐
│ Click "Resume All Incomplete"       │
│ ↓                                   │
│ For each of 12 languages:           │
│   → Call edge function              │
│   → Wait 90+ seconds                │
│ ↓                                   │
│ Total: 12 × 90s = 18+ MINUTES       │
│ Button says "Resuming..." entire    │
│ time with no progress indication    │
└─────────────────────────────────────┘

FIXED:
┌─────────────────────────────────────┐
│ Click "Resume All Incomplete"       │
│ ↓                                   │
│ For each language:                  │
│   → Show "Resuming Italian..."      │
│   → Fire edge function (fire & forget)
│   → Immediately proceed to next     │
│ ↓                                   │
│ Button releases after ALL STARTED   │
│ Active Evaluations card shows live  │
│ progress with auto-refresh          │
└─────────────────────────────────────┘
```

### Implementation Plan

#### 1. Change Resume to "Fire and Forget" Pattern

Instead of awaiting each edge function call, start them and let the Active Evaluations section show progress:

**File: `src/components/design-system/EvaluationHealthDashboard.tsx`**

```typescript
async function handleResumeAllIncomplete() {
  setIsResuming(true);
  
  for (const incomplete of incompleteEvals) {
    // Update status to in_progress in database FIRST
    await supabase.from('evaluation_progress')
      .update({ status: 'in_progress', updated_at: new Date().toISOString() })
      .eq('language_code', incomplete.language_code);
    
    // Fire edge function but DON'T await it
    supabase.functions.invoke('evaluate-translation-quality', {
      body: {
        targetLanguage: incomplete.language_code,
        startFromKey: incomplete.last_evaluated_key
      }
    }).catch(err => console.error(`Resume failed for ${incomplete.language_code}:`, err));
    
    toast.success(`Started ${incomplete.language_code.toUpperCase()}`);
  }
  
  // Release button immediately after all are STARTED
  setIsResuming(false);
  toast.info(`${incompleteEvals.length} evaluations started - see Active Evaluations for progress`);
  refresh();
}
```

#### 2. Add Auto-Refresh to Active Evaluations Section

**Current**: Only refreshes on button click or real-time subscription
**Fixed**: Add polling every 5 seconds when evaluations are active

```typescript
useEffect(() => {
  if (systemHealth.activeEvaluations > 0) {
    const interval = setInterval(() => {
      refresh();
      loadStats(); // Also refresh actual translation counts
    }, 5000);
    return () => clearInterval(interval);
  }
}, [systemHealth.activeEvaluations]);
```

#### 3. Show Currently Processing Language in Button

While resuming, show which language is being started:

```typescript
const [currentlyStarting, setCurrentlyStarting] = useState<string>('');

// In the button:
{isResuming ? (
  <>
    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
    Starting {currentlyStarting || '...'}
  </>
) : (
  // ...
)}
```

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/design-system/EvaluationHealthDashboard.tsx` | Fire-and-forget pattern, auto-refresh, progress indication |

### Expected Outcome

After implementation:
1. **Instant button release**: "Resume All" starts all evaluations and immediately releases
2. **Visual progress**: Active Evaluations section shows all running evaluations with live updates
3. **Per-language status**: Toast notifications show which languages started
4. **Auto-refresh**: Dashboard updates every 5 seconds while evaluations are running

### Workaround for Right Now

While waiting for the fix, you can:
1. **Refresh the page** - the evaluations are running in the background
2. **Click "Refresh" button** in the Language Evaluation Status section
3. The evaluations will complete in the background (they're already running based on the edge function logs)

