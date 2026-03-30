

# Fix `?tab=booking` Deep-Link in Admin

## Problem
The `getDefaultTabs` switch statement in `Admin.tsx` (lines 87-96) is missing a `case "booking"` entry. When navigating to `/cms?tab=booking`, it falls through to defaults, landing on CMS > Content > Pages.

## Fix — `src/pages/Admin.tsx`

Add one case to the switch block at line 95:

```typescript
case "booking": return { ...base, main: "booking" };
```

This goes right before `case "users"`. Single-line change.

| File | Change |
|------|--------|
| `src/pages/Admin.tsx` | Add `case "booking"` to `tabParam` switch |

