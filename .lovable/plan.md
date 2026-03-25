

# Fix Invisible IntegrationStrip Section

## Problem

The IntegrationStrip uses `bg-muted/50` as its background. With `--muted` at `0 0% 96%` (near-white) and the page background now at `#EAE7E1`, the section has zero visual contrast — it completely blends in.

## Fix

Update the IntegrationStrip's `defaultBackground` and section class to use a slightly darker/warmer tone that creates visible separation from the page background.

### Change in `src/components/IntegrationStrip.tsx`

- Change `defaultBackground="bg-muted/50"` to `defaultBackground="bg-muted"` on the `EditableBackground` wrapper
- Update `--muted` in `src/index.css` from `0 0% 96%` to a warmer value that contrasts with soft linen — approximately `34 10% 85%` (a slightly darker warm gray, like `#DBD8D2`). This gives visible separation while staying in the same warm family.

### Files changed

| File | Change |
|---|---|
| `src/index.css` | Update `--muted` from `0 0% 96%` to `34 10% 85%` for visible contrast against soft linen background |

This single CSS variable change fixes the IntegrationStrip and any other section using `bg-muted`.

