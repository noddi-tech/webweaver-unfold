

# Fix: FinalCTA Infinite Re-render Loop Causing Page Crash

## Root Cause

In `src/components/FinalCTA.tsx` line 86, the first `useEffect` has `t` in its dependency array:

```ts
}, [stylesLoaded, backgroundStyles, textStyles, t]);
```

The `t` function from `useAppTranslation` gets a **new reference on every render**. This causes:

1. Component renders
2. `useEffect` fires (because `t` changed)
3. Calls `setCtaData` inside the effect
4. State update triggers re-render
5. `t` has a new reference again → goto step 2
6. **Infinite loop** → React bails out → page sections stop rendering

The console confirms this: `"Maximum update depth exceeded"` at `FinalCTA.tsx`.

## Fix

**File: `src/components/FinalCTA.tsx`** (line 86)

Remove `t` from the dependency array. The `t` function is only used to set default fallback text for `ctaText` / `secondaryCtaText` in the initial state (lines 43, 47), not inside this effect. The effect only reads from `backgroundStyles` and `textStyles` context.

```ts
// Before
}, [stylesLoaded, backgroundStyles, textStyles, t]);

// After
}, [stylesLoaded, backgroundStyles, textStyles]);
```

## Impact

- Eliminates the infinite render loop
- All homepage sections (IntegrationStrip, CustomerTestimonial, etc.) render reliably
- No functionality change -- the CTA data loading logic is unchanged

## Files Changed

| File | Change |
|---|---|
| `src/components/FinalCTA.tsx` | Remove `t` from useEffect dependency array (line 86) |

