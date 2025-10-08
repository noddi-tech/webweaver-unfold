# Noddi Tech Design System Documentation

Last updated: 2025-10-08

## 🎨 Token Architecture

We use a **two-tier token system** for maintainability and consistency:

### Tier 0: Primitives (Base Scales)
**DO NOT reference these directly in components**

- `--color-primary-{50-900}`: Purple scale (brand primary)
- `--color-accent-{50-900}`: Pink scale (secondary/accents)
- `--color-neutral-{50-900}`: Grey scale (surfaces/text)
- Feedback scales: `--color-success-*`, `--color-warning-*`, `--color-error-*`

**Why hidden from CMS?** Primitives form the foundation. Changing them requires updating all semantic tokens that reference them.

### Tier 1: Semantic Tokens (Use These Everywhere)
**These are what you edit in the CMS**

#### Surface Colors
| Token | Purpose | Example Usage |
|-------|---------|---------------|
| `--bg-surface` | Main page background | Hero, ProductOverview |
| `--bg-alternate` | Alternating sections | WhyNoddi, HowItWorks |
| `--bg-inset` | Inset areas (wells) | Form fields, code blocks |
| `--bg-elevated` | Elevated cards | Modals, popovers |

#### Text Colors
| Token | Purpose | Example Usage |
|-------|---------|---------------|
| `--text-primary` | Body copy | Paragraphs, headings |
| `--text-secondary` | Supporting text | Captions, helper text |
| `--text-muted` | Disabled/subtle | Placeholder text |
| `--text-inverse` | On dark backgrounds | White text on primary button |

#### Interactive Colors
| Token | Purpose | Example Usage |
|-------|---------|---------------|
| `--interactive-primary` | Primary actions | CTA buttons, links |
| `--interactive-primary-hover` | Hover state | Button hover |
| `--interactive-secondary` | Secondary actions | Secondary buttons |

---

## 🔍 Glass Effects System

Use glass effects sparingly for visual hierarchy:

### When to Use Glass
✅ **Good Use Cases:**
- Card overlays on busy backgrounds
- Modal dialogs
- Dropdown menus
- Hover states for interactive elements

❌ **Avoid Using Glass For:**
- Navigation bars (use `.glass-solid` instead)
- Areas with critical text (accessibility risk)
- Mobile interfaces (performance concerns)

### Glass Classes

| Class | Opacity | Blur | Use Case |
|-------|---------|------|----------|
| `.glass-solid` | 100% | 0px | Critical UI (nav, buttons) |
| `.glass-card` | 95% | 16px | Standard cards (WCAG compliant) |
| `.glass-prominent` | 98% | 24px | Modals, popovers |
| `.glass-accent` | 8% tint | 12px | Decorative overlays |

**Accessibility:** Glass effects automatically disable for users with `prefers-reduced-transparency` enabled.

---

## ♿ Accessibility Guidelines

### Contrast Requirements
- **WCAG AA:** Minimum 4.5:1 for normal text
- **WCAG AAA:** Minimum 7:1 for normal text
- **Large text:** Minimum 3:1 (18pt+ or 14pt+ bold)

**Tool:** Use the "Fix All Contrast" button in the CMS color editor

### Focus States
All interactive elements must have a visible focus indicator:

```tsx
<button className="focus-ring">Click me</button>
```

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Tab order should follow visual flow
- Use `role` and `aria-*` attributes for screen readers

---

## 📐 Spacing Grid

All spacing values must be multiples of **4px** for pixel-perfect alignment:

| Token | Value | Use Case |
|-------|-------|----------|
| `--spacing-xs` | 8px | Icon padding, chip gaps |
| `--spacing-sm` | 16px | Button padding, card gaps |
| `--spacing-md` | 32px | Section padding |
| `--spacing-lg` | 48px | Component spacing |
| `--spacing-xl` | 64px | Large sections |
| `--spacing-section` | 120px | Between page sections |

**Enforcement:** Tailwind config restricts spacing to these values only.

---

## 🎭 Dark Mode

Dark mode automatically inverts **semantic tokens only**, not primitives.

**How it works:**
```css
.dark {
  --bg-surface: var(--color-neutral-900);  /* Was neutral-50 */
  --text-primary: var(--color-neutral-50); /* Was neutral-900 */
  /* ...other semantic overrides */
}
```

**Result:** Primitives stay the same, but their semantic mapping changes.

---

## 🚀 Export Tools

### Figma Export
1. Go to CMS → Design System → Colors
2. Click "Export to Figma"
3. Import JSON file into Figma using [Tokens Studio plugin](https://tokens.studio/)

### CSS Variables Export
All tokens are available as CSS variables:

```css
.my-component {
  background: hsl(var(--bg-surface));
  color: hsl(var(--text-primary));
}
```

---

## 🔄 Making Changes

### For Developers
1. Edit primitives in `src/index.css` (lines 12-60)
2. Update semantic mappings if needed (lines 62-88)
3. Test both light and dark modes
4. Run accessibility audit: `npm run lint:a11y` (future)

### For Content Editors
1. Go to `/cms` → Design System → Colors
2. Edit semantic tokens only (primitives are hidden)
3. Use "Fix All Contrast" to ensure accessibility
4. Click "Save" to apply changes
5. Test on live preview

---

## 📚 References

- [Radix UI Theming Guide](https://www.radix-ui.com/themes/docs/theme/color)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tokens Studio for Figma](https://tokens.studio/)
