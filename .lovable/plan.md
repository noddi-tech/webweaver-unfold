

# Polish /book Page — Loading, Validation, Mobile, Header CTA

## Summary

Add skeleton loading states, zod+react-hook-form validation, error handling with toast, mobile-responsive time slots, disabled weekends, entrance animation, and a "Book a Demo" CTA in the header.

## File Changes

### 1. `src/pages/BookMeeting.tsx` — Major rewrite

**Skeletons (Step 1):** Replace spinner with 3 Skeleton cards (import from `@/components/ui/skeleton`) — each mimicking the event card shape.

**Skeletons (Step 2 slots):** Add `loadingSlots` state. When a date is selected, show a skeleton grid (6 skeleton rectangles) while bookings are being fetched. Set `loadingSlots = true` before fetch, `false` after.

**No slots message:** Already exists at line 457 — enhance with a friendly icon and "Please try another day." text.

**Error handling on submit:** Wrap the insert in try/catch. On error, show `toast({ variant: "destructive", title: "This time slot was just booked. Please select another time." })`. Return to step 2 with date preserved (don't clear `selectedDate`).

**Form validation with zod + react-hook-form:**
- Add zod schema: name min 2 chars, email valid, company optional, message optional
- Use `useForm` with `zodResolver`
- Replace manual form state with register/errors
- Show inline error messages

**Loading spinner on submit button:** Show a spinning icon + "Confirming..." text when `submitting` is true.

**Mobile time slots:** Change the slot grid to `flex overflow-x-auto gap-2 md:grid md:grid-cols-3` — horizontal scroll on mobile, grid on desktop.

**Disable weekends:** Compute `availableDays` from `availabilityRules` (which day_of_week values have rules). Pass a `disabled` function to Calendar that also disables days with no availability rules (weekends if no Sat/Sun rules exist).

**Entrance animation:** Add `animate-fade-in` class to the outer wrapper div.

### 2. `src/components/Header.tsx` — Already has "Book a Demo" CTA

Looking at the existing code (lines ~300-305), there's already a "Book a Demo" button linking to `/contact`. Change it to link to `/book` instead — both the desktop and mobile versions.

| File | Change |
|---|---|
| `src/pages/BookMeeting.tsx` | Add skeletons, zod validation, toast errors, mobile slots, weekend disable, animation |
| `src/components/Header.tsx` | Change "Book a Demo" link from `/contact` to `/book` (desktop + mobile) |

