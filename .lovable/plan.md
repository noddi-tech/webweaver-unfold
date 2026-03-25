

# Fix RotatingHeadline Mobile Font Size

## Problem
The rotating headline uses `text-2xl` at mobile, while all other section headings use `text-3xl md:text-4xl font-bold`. This makes the hero heading noticeably smaller than headings like "Works with the systems you already use" or "How Navio works".

## Fix

**File: `src/components/RotatingHeadline.tsx`**

Change all four `h1` class strings from:
```
text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold
```
to:
```
text-3xl md:text-4xl lg:text-5xl font-bold
```

This matches the `text-3xl md:text-4xl` pattern used by every other section heading, while keeping the `lg:text-5xl` bump since this is the hero (h1) and should be slightly larger on desktop.

Four instances to update: lines 43, 47, 67, and 82.

