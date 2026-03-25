

# Trust Bar — Reuse LogoMarquee with New Section Filter

## Approach

Rather than creating a new component, make the existing `LogoMarquee` configurable via props so it can be reused for the trust bar with a different CMS section, label, and styling.

## Changes

### 1. `src/components/LogoMarquee.tsx` — Add props for reusability

Add optional props:
- `section` (default: `'logo-marquee'`) — CMS `images.section` filter
- `label` / `labelKey` — override the "Trusted by" text and translation key
- `className` — outer section styling override
- `grayscale` (default: `false`) — when true, logos render grayscale with full-color on hover
- `pauseOnHover` (default: `false`) — pauses marquee animation on hover
- `compact` (default: `false`) — uses tighter padding (`py-4` instead of `py-8`)

This keeps one component, one CMS query pattern, one animation system.

### 2. `src/pages/Index.tsx` — Add Trust Bar instance

Insert a `<LogoMarquee>` between `<Hero />` and `<ScrollingFeatureCards />` configured as:

```text
<LogoMarquee
  section="trust-bar"
  labelKey="trust_bar.label"
  labelFallback="Trusted by service companies across Scandinavia"
  compact
  grayscale
  pauseOnHover
  className="bg-muted/30 border-y border-border/50"
/>
```

The existing `LogoMarquee` (if used elsewhere) continues working with its defaults unchanged.

### 3. Styling additions in `LogoMarquee.tsx`

- **Grayscale**: Each logo `img` gets `grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300`
- **Pause on hover**: Outer marquee container gets `group` class; animation div gets `group-hover:[animation-play-state:paused]`
- **Compact**: `py-4 md:py-5` instead of `py-8`
- **Fade edges**: Already implemented via CSS mask (reused as-is)

### CMS usage

Logos are managed in the existing `images` table with `section = 'trust-bar'`. Upload logos via the existing Image Manager in the admin panel. No DB migration needed.

## Files

| File | Change |
|---|---|
| `src/components/LogoMarquee.tsx` | Add configurable props (`section`, `labelKey`, `grayscale`, `pauseOnHover`, `compact`, `className`) |
| `src/pages/Index.tsx` | Add `<LogoMarquee ... />` trust bar instance between Hero and ScrollingFeatureCards |

