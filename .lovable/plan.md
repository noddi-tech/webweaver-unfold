

# Fix: Trust Bar Not Showing Logos

## Root Cause

The logos in the CMS are assigned to section `logo-marquee`, but the `<LogoMarquee>` instance on the homepage is configured with `section="trust-bar"`. No images exist with `section = 'trust-bar'`, so the component returns `null`.

## Fix

**`src/pages/Index.tsx`** — Change the trust bar's `section` prop from `"trust-bar"` to `"logo-marquee"` so it reads from the same section where the logos are stored:

```tsx
<LogoMarquee
  section="logo-marquee"          // was "trust-bar"
  labelKey="trust_bar.label"
  labelFallback="Trusted by service companies across Scandinavia"
  compact
  grayscale
  pauseOnHover
  className="bg-muted/30 border-y border-border/50"
/>
```

One line change. The 7 logos already in the CMS (Noddi, Carglass, Tronderdekk, BestDrive, Dekkfix, Shine, Elitebilvask) will immediately appear in the trust bar with grayscale styling and marquee scroll.

