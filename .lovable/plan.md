

# Move /book Page into /:lang/ Routing Structure

## Problem

The `/book` page is currently a standalone route outside the `/:lang/` structure, so it lacks the Header, Footer, and translation support that every other public page has.

## Changes

### 1. `src/pages/BookMeeting.tsx` — Add Header, Footer, translations

- Import `Header`, `Footer`, `HreflangTags`, and `useAppTranslation`
- Wrap page content with Header at top and Footer at bottom
- Replace all hardcoded strings ("Book a Meeting", "Select a meeting type...", "No available times...", "Confirm Booking", etc.) with `t()` translation keys
- Use `useParams` to read `lang` for timezone/locale formatting

### 2. `src/App.tsx` — Move routes into /:lang/ structure

- Add `/:lang/book` route wrapped in `<LanguageSync>` (alongside all other language-prefixed routes)
- Add `/book` as a `<LanguageRedirect />` route (alongside all other non-prefixed redirects)
- Keep `/book/:token` as-is (that's the candidate booking token route, different purpose)

### 3. `src/components/Header.tsx` — Fix CTA link

- Update the "Book a Demo" CTA from linking to `/book` to using `LanguageLink` with `to="/book"` so it gets the proper language prefix

| File | Change |
|---|---|
| `src/App.tsx` | Add `/:lang/book` route + `/book` redirect |
| `src/pages/BookMeeting.tsx` | Add Header/Footer, replace hardcoded strings with `t()` keys |
| `src/components/Header.tsx` | Use `LanguageLink` for the Book a Demo CTA |

