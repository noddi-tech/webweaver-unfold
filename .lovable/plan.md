

# Redesign WhyNavio: Sanna-Inspired Before/After Comparison

## What changes
Redesign the Before/After cards in `WhyNavio.tsx` to create a clear visual "winner" (With Navio) vs a deliberately muted "loser" (Without Navio), add a floating VS badge, remove the subtitle paragraph, and tighten section padding.

## Single file: `src/components/WhyNavio.tsx`

### 1. Remove subtitle paragraph
Delete the `EditableTranslation` block wrapping the `<p>` subtitle (lines 45-49). Keep eyebrow + heading only.

### 2. Reduce section padding
Change `py-12 md:py-16 lg:py-section` to `py-8 md:py-12 lg:py-16` for tighter vertical rhythm.

### 3. "Without Navio" card — muted, flat, unappealing
- Background: `bg-muted/50` (gray, washed out)
- Border: `border border-border/50` (subtle, nearly invisible)
- Title text: `text-muted-foreground` (faded)
- List item text: `text-muted-foreground/80` (subdued)
- X icons stay `text-destructive` but at reduced opacity: `text-destructive/60`
- No shadow, no elevation — intentionally flat

### 4. "With Navio" card — the clear winner
- Border: `border-2 border-primary` (bold brand border)
- Background: `bg-card` with a decorative gradient glow element in top-right corner using `bg-gradient-to-br from-primary/10 via-transparent to-transparent` as a pseudo-element overlay
- Slight scale lift: `lg:scale-105` with `shadow-lg` for elevation
- Title: `text-primary font-bold`
- Checkmarks: `text-primary` (vibrant brand green/primary)
- List text: `text-foreground font-medium`
- Add `relative overflow-hidden` for the gradient accent blob

### 5. Floating "VS" badge
- Absolute-positioned circular badge centered between the two cards
- `absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10`
- Styled: `w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shadow-lg`
- The grid wrapper gets `relative` to contain it
- On mobile (stacked), hide or reposition vertically between cards

### 6. Reduce gap between cards
Change `gap-8` to `gap-6` to bring cards closer (VS badge bridges them).

### 7. Reduce bottom margin
Change `mb-12` on the grid to `mb-8`.

## Visual result

```text
┌─────────────────────┐         ┌──────────────────────────┐
│  Without Navio      │         │  With Navio        ✦glow │
│  (muted gray bg)    │  [VS]   │  (bold primary border)   │
│  ✕ Disconnected...  │         │  ✓ One unified...        │
│  ✕ Manual data...   │         │  ✓ Automatic sync...     │
│  ✕ Spreadsheet...   │         │  ✓ Real-time...          │
│  ✕ Lost follow...   │         │  ✓ Automated...          │
│  flat, no shadow    │         │  elevated, shadow-lg     │
└─────────────────────┘         └──────────────────────────┘
```

## Technical notes
- Keep `EditableCard` wrapper for CMS card styling — override defaults via props
- Keep all `EditableTranslation` wrappers for bullet text
- Keep `EditableListIcon` for icon customization
- VS badge uses only design system tokens (`bg-primary`, `text-primary-foreground`)
- Gradient glow is a `div` with `absolute inset-0` and gradient classes, not hardcoded colors
- Mobile: VS badge shown between stacked cards with `lg:absolute lg:top-1/2` positioning

