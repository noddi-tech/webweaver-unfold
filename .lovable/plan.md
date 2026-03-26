

# Phase 6: Public Page Polish & CTA Integration

## Summary

Polish the /book page with a minimal focused header, SEO meta tags, empty states, confirmation email copy, and mobile optimization. Also update FinalCTA to link to /book. The Header already has a "Book a Demo" CTA button (added in a previous phase).

## Changes

### 1. `src/pages/BookMeeting.tsx` — Major updates

**Minimal header**: Replace `<Header />` with a custom minimal header showing only the Navio logo (fetched from `brand_settings`) linking to `/` and a "Back to site" text link. No full navigation.

**SEO meta tags**: Add `<Helmet>` (from `react-helmet-async` or a `<title>` + `<meta>` via `document.title` in a `useEffect`) with:
- Title: "Book a Meeting — Navio Solutions"
- Description: "Schedule a demo or meeting with the Navio team..."

**Empty state**: After loading completes, if `eventTypes.length === 0`, show a friendly card with `CalendarX2` icon: "We're not accepting bookings at the moment. Please reach out to hello@noddi.tech" with a mailto link.

**Confirmation email mention**: In step 4, add below the existing confirmation text: "You'll receive a Google Calendar invite at [guest_email] within a few minutes."

**Mobile optimization**:
- Calendar: add `w-full` class, remove fixed width constraints
- Time slots grid: change from `md:grid-cols-3` to `grid-cols-2 md:grid-cols-3` (always 2-col on mobile instead of horizontal scroll)
- Slot buttons: ensure `min-h-[44px]` for touch targets
- Form: already single-column, just ensure inputs have `min-h-[44px]`
- Step 2 grid: change `md:grid-cols-[280px_1fr]` layout to stack on mobile (already does via `grid` without cols on small screens)

### 2. `src/components/FinalCTA.tsx` — Update CTA URL

Change the default `ctaUrl` from `/contact` to `/book` (line 43). This is the fallback when no CMS override exists.

### 3. `src/components/Header.tsx` — Already done

The Header already has a persistent "Book a Demo" CTA button linking to `/book` (lines ~280-285 desktop, ~300-305 mobile). No changes needed.

## File summary

| File | Action |
|---|---|
| `src/pages/BookMeeting.tsx` | Edit — minimal header, SEO, empty state, email mention, mobile polish |
| `src/components/FinalCTA.tsx` | Edit — change default ctaUrl from `/contact` to `/book` |

## Technical details

- For SEO, use `useEffect` to set `document.title` and create/update meta description tag (avoids adding react-helmet dependency)
- Minimal header: a simple `<header>` with logo from `brand_settings` query (already fetched in Header component pattern) + "Back to site" `LanguageLink`
- Time slot buttons get `min-h-[44px]` and grid changes from `flex overflow-x-auto md:grid md:grid-cols-3` to `grid grid-cols-2 md:grid-cols-3 gap-2`
- Input/Button elements get explicit `min-h-[44px]` for WCAG touch targets

