

# Add `?tab=` URL Support to Admin Page (3-Level Deep Linking)

## Problem

The Internal Hub links use `?tab=pricing`, `?tab=blog`, etc., but Admin.tsx only reads `?section=` for some sub-tabs. The main-level `<Tabs>` uses uncontrolled `defaultValue`, so URL-based navigation doesn't work. None of the 3 tab levels respond to URL params.

## Solution — `src/pages/Admin.tsx`

### 1. Extend `getDefaultTabs()` to read `?tab=` param

Add a `tabParam = searchParams.get("tab")` and map values to all three levels:

| `?tab=` value | Level 1 (main) | Level 2 | Level 3 |
|---------------|----------------|---------|---------|
| `pricing` | `sales` | `pricing-config` | — |
| `blog` | `cms` | `content` | `blog` |
| `translations` | `translations` | — | — |
| `design` | `design` | — | — |
| `offers` | `sales` | `offers` | — |
| `leads` | `sales` | `leads` | — |

### 2. Convert main `<Tabs>` to controlled

Change from `defaultValue={defaults.main}` to `value={mainTab}` + `onValueChange={setMainTab}` using `useState(defaults.main)`. This ensures the tab param is respected on navigation from Internal Hub.

Do the same for any nested tabs that need deep-link support (CMS level 2 and level 3 content tabs).

### 3. Return expanded defaults

Update the defaults object to include a `content` key for the 3rd-level CMS content tabs (pages, blog, etc.), so `?tab=blog` can set `{ main: "cms", cms: "content", content: "blog" }`.

## Files changed

| File | Change |
|------|--------|
| `src/pages/Admin.tsx` | Read `?tab=` param, map to 3 levels, convert to controlled tabs |

