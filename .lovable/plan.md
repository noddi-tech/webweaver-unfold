

# Three UI Fixes: Testimonial Background, Integration Strip Mobile, Footer Card

## 1. Make Testimonial Section Background Editable

Wrap the `<section>` in `CustomerTestimonial.tsx` with `EditableBackground`, using `bg-muted/30` as the default (matching current hardcoded value).

**File: `src/components/CustomerTestimonial.tsx`**
- Import `EditableBackground`
- Wrap the `<section>` with `<EditableBackground elementId="testimonial-section" defaultBackground="bg-muted/30">`
- Remove the hardcoded `bg-muted/30` from the section (EditableBackground applies it)

## 2. Move SVG Diagram Above Badges on Mobile

Currently the grid has text (left) then SVG (right) in a single `grid-cols-1 lg:grid-cols-2`. On mobile (single column), text comes first, SVG second. We need SVG first on mobile.

**File: `src/components/IntegrationStrip.tsx`**
- Add `order-2 lg:order-1` to the left text column div
- Add `order-1 lg:order-2` to the right SVG column div

This makes the SVG appear above the text/badges on mobile, while preserving desktop layout.

## 3. Remove Footer Card Wrapper

Remove the `rounded-3xl overflow-hidden relative bg-card` wrapper div and the outer padding. The footer should just follow the page background color.

**File: `src/components/Footer.tsx`**
- Change `<footer className="pt-16 pb-2.5 px-2.5">` to `<footer className="pt-16 pb-8">`
- Remove the `<div className="rounded-3xl overflow-hidden relative bg-card">` wrapper entirely
- Keep the container div with its content

## Files Changed

| File | Change |
|---|---|
| `src/components/CustomerTestimonial.tsx` | Wrap section with EditableBackground |
| `src/components/IntegrationStrip.tsx` | Add CSS order classes for mobile-first SVG |
| `src/components/Footer.tsx` | Remove card wrapper, use plain background |

