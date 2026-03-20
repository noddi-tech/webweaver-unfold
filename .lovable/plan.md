

# Design Overhaul: Navio Homepage — Curbee-Inspired Polish

Based on the design critique comparing naviosolutions.com against curbee.com, this plan addresses the highest-impact issues in priority order.

## Summary of Changes

Five workstreams targeting the critical and moderate findings. Each is independently deployable.

---

## 1. Add "Book a Demo" CTA to Navigation (Critical)

**Problem**: No persistent conversion CTA in the header. Curbee has a prominent dark "Book Demo" button always visible.

**Change**: In `src/components/Header.tsx`, add a persistent "Book a Demo" button in the desktop nav (right side, next to language switcher) that links to `/contact`. This should render regardless of `headerSettings.show_auth_buttons` — it's always visible.

- Filled primary button style, `variant="default"` with `size="sm"`
- Also add to mobile menu as a prominent top item
- Translation key: `header.book_demo`

---

## 2. Fix Vertical Spacing & Eliminate Dead Zones (Critical)

**Problem**: Inconsistent gaps between sections — some 40px, others 200px+.

**Changes**:
- **`src/components/Hero.tsx`**: Tighten bottom padding. The hero currently has `pb-8 sm:pb-12` which is fine, but the internal `space-y-12` between the image and logo marquee creates excessive gaps. Reduce to `space-y-6`.
- **`src/components/ScrollingFeatureCards.tsx`**: Audit section padding — ensure it uses the standard `py-12 md:py-16 lg:py-section` pattern.
- **`src/index.css`**: Verify `--section-spacing` value. If `lg:py-section` resolves to something larger than 120px, cap it. Add a comment documenting the 80-120px target range.
- Remove any `mb-16` on section headers that creates excessive internal gaps — standardize to `mb-8 md:mb-12`.

---

## 3. Strengthen Text Contrast (Moderate → High Impact)

**Problem**: Hero subtitle uses `text-muted-foreground` which is too light against the gradient. Step cards have pale text on gradient backgrounds.

**Changes**:
- **`src/components/Hero.tsx`**: Change hero subtitle from `text-muted-foreground` to `text-foreground/80` for stronger contrast while keeping it secondary.
- **`src/components/HowItWorks.tsx`**: Audit step card text colors. Ensure text on gradient/colored card backgrounds meets WCAG AA (4.5:1 for body text). Use `text-white` with sufficient background darkness.
- **USP section in Hero**: The USP titles already use `text-white` which is good, but descriptions use `text-white/70` — increase to `text-white/80` minimum.

---

## 4. Add Persistent "Book a Demo" Button to Header (via CMS)

Since the header is CMS-driven (`header_settings`), the code change adds a **hardcoded CTA** that renders independently of CMS settings, ensuring it's always present. This is the Curbee pattern — the demo CTA is never optional.

---

## 5. Logo Marquee: Static Display for Small Sets (Moderate)

**Problem**: 3 logos looping in a marquee looks thin.

**Change in `src/components/LogoMarquee.tsx`**:
- If `logos.length <= 4`, render statically in a centered flex row with a "Trusted by" label above
- Only use the scrolling marquee animation when there are 5+ logos
- Add a "Trusted by leading Nordic service providers" label above the logos (translation key: `hero.trusted_by`)

---

## Files to Modify

| File | Change |
|---|---|
| `src/components/Header.tsx` | Add persistent "Book a Demo" CTA button |
| `src/components/Hero.tsx` | Fix subtitle contrast, tighten spacing, improve USP text opacity |
| `src/components/LogoMarquee.tsx` | Static display for ≤4 logos, add "Trusted by" label |
| `src/components/HowItWorks.tsx` | Audit step card text contrast |
| `src/components/WhyNavio.tsx` | Standardize section header margins |
| `src/components/ScrollingFeatureCards.tsx` | Standardize section padding |

---

## Out of Scope (Future Iterations)

- Button style consolidation (requires CMS-wide audit)
- Card design unification (affects multiple CMS-driven components)
- Full WCAG accessibility audit
- Feature card "scannable overview" like Curbee's 4-card summary

These are larger systemic changes better handled as separate workstreams.

