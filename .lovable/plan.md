

# Redesign Auth Page + New Internal Pages Hub

## Overview

Two changes: (1) Redesign `/auth` to make Google OAuth the primary login method, with email/password as a secondary collapsible option. (2) Create a new `/internal` page that serves as a hub with categorized cards linking to all internal/admin routes. Both pages use the brand color system (Federal Blue `#201466`, Vivid Purple `#5B4ACF`, Lavender `#EEEAFC`, Bright Snow `#F8F7F4`).

## 1. Redesign `/auth` — Google-first login

### Current state
Google button is secondary, below the email/password form.

### New design
- Clean centered card on `#F8F7F4` background, no Header component (cleaner admin feel)
- Navio logo at top
- Large "Sign in with Google" button as the primary CTA (Federal Blue background, white text, Google icon)
- Below: a subtle collapsible "Sign in with email" section (collapsed by default) containing the existing email/password form
- "Forgot password?" and "Need an account?" links remain in the collapsible section
- Footer link: "Go to Internal Hub →" linking to `/internal`

### File: `src/pages/Auth.tsx`
- Remove `<Header />`
- Reorder: Google button first, then collapsible email form
- Add logo, update styling to brand colors
- Add link to `/internal`

## 2. New Internal Pages Hub — `/internal`

### Purpose
A post-login landing page with categorized cards for all internal and admin routes. Only visible to authenticated users.

### Categories and routes

**Content Management**
- CMS Dashboard → `/cms`
- Pricing Config → `/cms?tab=pricing`
- Blog Manager → `/cms?tab=blog`
- Translations → `/cms?tab=translations`

**Sales & Business**
- Pricing (detailed) → `/en/pricing_detailed`
- Offers → `/cms?tab=offers`
- Leads → `/cms?tab=leads`

**Pages (Public)**
- Homepage → `/en`
- Features → `/en/features`
- Solutions → `/en/solutions`
- Partners → `/en/partners`
- About Us → `/en/about-us`
- Careers → `/en/careers`
- Blog → `/en/blog`
- Contact → `/en/contact`
- Pricing → `/en/pricing`
- Book Meeting → `/en/book`

**Admin & Settings**
- Auth / Login → `/auth`
- Design System → `/cms?tab=design`

### Design
- Grid of cards grouped by category headers
- Each card: icon (from lucide), title, short description, colored left border using brand purple
- Card background: white with subtle shadow, hover lift effect
- Category headers in Federal Blue
- Page background: `#F8F7F4`
- Auth-gated: redirect to `/auth` if not logged in

### File: `src/pages/Internal.tsx` (new)
- Auth check using `supabase.auth.getSession()`
- Categorized card grid
- Responsive: 1 col mobile, 2 col tablet, 3 col desktop

## 3. Routing update

### File: `src/App.tsx`
- Import new `Internal` page
- Add route: `<Route path="/internal" element={<Internal />} />`
- Place alongside other static admin routes (after `/auth`)

## File summary

| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | Redesign: Google-first, collapsible email, brand styling, link to /internal |
| `src/pages/Internal.tsx` | New: categorized card hub for all internal routes |
| `src/App.tsx` | Add `/internal` route |

