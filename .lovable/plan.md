

# Fix Blank Screen on Event Edit + Calendar Full-Width

## Two issues

### 1. Blank screen when editing event types
**Cause**: Lines 546 and 556 in `BookingManager.tsx` have `<SelectItem value="">Fixed (no range)</SelectItem>`. Radix Select throws a fatal error when a SelectItem has an empty string value.

**Fix**: Change `value=""` to `value="none"` for both SelectItems, and update the corresponding state handling to treat `"none"` as the "no range" option (mapping it back to `null`/empty when saving).

### 2. Calendar still not full-width
**Cause**: The `month` class in `calendar.tsx` is `space-y-4` without `w-full`, so the inner month container doesn't stretch to fill the calendar.

**Fix**: Add `w-full` to the `month` classNames in `calendar.tsx`.

## Files to change

| File | Change |
|------|--------|
| `src/components/design-system/BookingManager.tsx` | Change two `<SelectItem value="">` to `value="none"`, handle "none" in state logic |
| `src/components/ui/calendar.tsx` | Add `w-full` to `month` class |

