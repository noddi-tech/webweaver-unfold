

# Reorder IntegrationStrip Mobile Layout

## Problem
On mobile (single column), the SVG diagram appears at the very top (order-1) and all text + badges appear below (order-2). The user wants the SVG to sit **between** the description text and the Eontyre badge — not above everything.

## Solution
Split the left column into two parts and move the SVG between them on mobile using CSS order classes.

**File: `src/components/IntegrationStrip.tsx`**

Change the grid from 2 items to 3:
1. **Text block** (eyebrow + headline + description) — `order-1` always
2. **SVG diagram** — `order-2` on mobile, `order-2 lg:order-3` on desktop (right column)
3. **Badges block** (partner pill + tech badges + CTA link) — `order-3` on mobile, `order-1 lg:order-2` stays in left column on desktop

Use `lg:col-start-1 lg:row-start-1` and `lg:row-span` to keep the two text blocks visually merged in the left column on desktop while the SVG stays in the right column.

Simpler approach: keep the 2-column grid for desktop but use 3 grid children with `lg:col-start` / `lg:row` placement:

```
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
  {/* 1: Eyebrow + headline + description — always first */}
  <div className="space-y-6 order-1 lg:order-1 lg:col-start-1">
    ...eyebrow, headline, description...
  </div>

  {/* 2: SVG diagram — second on mobile, right column on desktop spanning full height */}
  <div className="order-2 lg:order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2 flex justify-center lg:justify-end">
    <svg .../>
  </div>

  {/* 3: Partner pill + badges + CTA — third on mobile, continues left column on desktop */}
  <div className="space-y-6 order-3 lg:order-3 lg:col-start-1">
    ...partner pill, tech badges, CTA link...
  </div>
</div>
```

This gives the exact mobile order: text → SVG → badges, while on desktop the two left-column blocks stack naturally and the SVG fills the right column.

| File | Change |
|---|---|
| `src/components/IntegrationStrip.tsx` | Split left column into two grid children, reorder with CSS grid placement |

