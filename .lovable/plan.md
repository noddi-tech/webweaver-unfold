

# Fix Contrast on Internal Hub Cards

## Problem

From the screenshot:
1. **"Pricing Config" card title missing** — not visible at all (on hover or otherwise)
2. **Card descriptions** (e.g., "Manage pricing plans") are low contrast on the dark `bg-card` background
3. **Category headers** ("Content Management", etc.) use `hsl(var(--primary))` which is dark on a light page — these are fine
4. **Hover state** makes text unreadable (likely `group-hover:text-foreground` resolves to a dark color)

## Root cause

Cards use `bg-card` (Federal Blue `#201466`), but text uses `text-card-foreground` and `text-muted-foreground` which are also dark. The hover class `group-hover:text-foreground` is also dark.

## Fix — `src/pages/Internal.tsx`

| Element | Current class | Fix |
|---------|--------------|-----|
| Card title `<h3>` | `text-card-foreground group-hover:text-foreground` | `text-white` (remove hover override) |
| Card description `<p>` | `text-muted-foreground` | `text-white/60` |
| Icon circle background | `hsl(var(--accent) / 0.1)` | `rgba(255,255,255,0.15)` |
| Icon color | `hsl(var(--accent))` | `white` with slight opacity |

Single file, ~4 inline style changes on the card `Link` component's children.

