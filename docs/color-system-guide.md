# Color System Management Guide

All colors, gradients, and glass effects are now managed through the CMS database. This ensures a single source of truth and allows non-technical users to manage the design system.

## Overview

The color system has been fully migrated from hardcoded files to database-driven configuration:

- **Database Table**: `color_tokens` stores all colors, gradients, and effects
- **CMS Interface**: Design System → Colors & Tokens (accessible at `/admin`)
- **React Hook**: `useColorSystem()` loads colors dynamically
- **Helper Hook**: `useAllowedBackgrounds()` provides gradient/color lists

## Adding New Gradients

### Via CMS (Recommended)

1. Navigate to **Design System → Colors & Tokens** in the admin panel
2. Click **"Add Color Token"**
3. Fill in the form:
   - **CSS Variable**: `--gradient-custom` (must start with `--`)
   - **Label**: "Custom Gradient"
   - **Type**: Select "gradient"
   - **Value**: `linear-gradient(135deg, hsl(X X% X%), hsl(Y Y% Y%))`
   - **Preview Class**: `bg-gradient-custom`
   - **Category**: "gradients"
   - **Optimal Text Color**: "white" or "dark"
4. Click **Save**
5. The gradient is **instantly available** in all edit modals and components

### Via Database (Advanced)

```sql
INSERT INTO color_tokens (
  css_var,
  label,
  value,
  description,
  color_type,
  category,
  preview_class,
  optimal_text_color,
  sort_order,
  active
) VALUES (
  '--gradient-custom',
  'Custom Gradient',
  'linear-gradient(135deg, hsl(249 67% 24%), hsl(266 85% 58%))',
  'A custom gradient for special use cases',
  'gradient',
  'gradients',
  'bg-gradient-custom',
  'white',
  10,
  true
);
```

## Using Colors in Code

### Loading All Colors

```typescript
import { useColorSystem } from '@/hooks/useColorSystem';

function MyComponent() {
  const {
    SOLID_COLORS,
    GRADIENT_COLORS,
    GLASS_EFFECTS,
    ALL_BACKGROUND_OPTIONS,
    TEXT_COLOR_OPTIONS,
    loading,
    error
  } = useColorSystem();

  if (loading) return <Spinner />;
  
  // Use colors...
}
```

### Getting Allowed Backgrounds for Edit Modals

```typescript
import { useAllowedBackgrounds } from '@/hooks/useAllowedBackgrounds';

function MyComponent() {
  const { allowedBackgrounds, loading } = useAllowedBackgrounds();

  return (
    <EditableBackground
      elementId="my-section"
      defaultBackground="bg-card"
      allowedBackgrounds={allowedBackgrounds}
    >
      {/* Your content */}
    </EditableBackground>
  );
}
```

## Managing Icon Backgrounds

Icons now have their own CMS-managed styling via the `icon_styles` table.

### Using EditableIcon

```typescript
import { EditableIcon } from '@/components/EditableIcon';
import { Calendar } from 'lucide-react';

function MyComponent() {
  return (
    <EditableIcon
      elementId="my-icon"
      icon={Calendar}
      defaultBackground="bg-gradient-primary"
      size="default"
    />
  );
}
```

### Icon Sizes

- `sm`: 40x40px (w-10 h-10)
- `default`: 56x56px (w-14 h-14)
- `lg`: 64x64px (w-16 h-16)
- `xl`: 80x80px (w-20 h-20)

### Editing Icon Styles (CMS)

In edit mode, hover over any `EditableIcon` to see the edit button. Click to customize:
- Background gradient/color
- Icon color
- Size
- Shape (rounded-xl, circle, square, etc.)

## Architecture

### Database Schema

```
color_tokens
├─ id (uuid)
├─ css_var (text, unique) - CSS variable name (e.g., "--gradient-primary")
├─ label (text) - Human-readable name
├─ value (text) - CSS value (e.g., "linear-gradient(...)")
├─ description (text) - Usage notes
├─ color_type (text) - "solid" | "gradient" | "glass"
├─ category (text) - "surfaces" | "gradients" | "effects" | etc.
├─ preview_class (text) - Tailwind class (e.g., "bg-gradient-primary")
├─ optimal_text_color (text) - "white" | "dark" | "auto"
├─ sort_order (int) - Display order
└─ active (boolean) - Whether to show in UI
```

### Color Flow

```
Database (color_tokens)
    ↓
useColorSystem() hook
    ↓
React Components
    ↓
User sees colors in edit modals
```

### Component Architecture

1. **useColorSystem**: Loads all colors from database
2. **useAllowedBackgrounds**: Extracts preview classes for EditableBackground
3. **useIconStyle**: Manages icon-specific styling
4. **EditableIcon**: Renders icons with CMS-managed backgrounds
5. **EditableBackground**: Allows background selection from CMS colors

## Migration Notes

### Before (Hardcoded)

```typescript
// ❌ WRONG - Hardcoded list
<EditableBackground
  allowedBackgrounds={[
    'bg-gradient-hero',
    'bg-gradient-sunset',
    'bg-gradient-warmth'
  ]}
/>
```

### After (CMS-Driven)

```typescript
// ✅ CORRECT - Dynamic from CMS
const { allowedBackgrounds } = useAllowedBackgrounds();

<EditableBackground
  allowedBackgrounds={allowedBackgrounds}
/>
```

## Default Gradients

The system comes with these pre-configured gradients:

| Name | CSS Variable | Preview Class | Description |
|------|--------------|---------------|-------------|
| Primary | `--gradient-primary` | `bg-gradient-primary` | Default gradient (purple shades) |
| Hero | `--gradient-hero` | `bg-gradient-hero` | Same as primary |
| Sunset | `--gradient-sunset` | `bg-gradient-sunset` | Purple to orange |
| Warmth | `--gradient-warmth` | `bg-gradient-warmth` | Purple to pink to orange |
| Ocean | `--gradient-ocean` | `bg-gradient-ocean` | Blue to cyan to green |
| Fire | `--gradient-fire` | `bg-gradient-fire` | Orange to purple |

All gradients use HSL color space for consistency.

## Tailwind Integration

Gradients are automatically available in Tailwind via `tailwind.config.ts`:

```typescript
backgroundImage: {
  'gradient-primary': 'linear-gradient(...)',
  'gradient-hero': 'linear-gradient(...)',
  // ... etc
}
```

When adding a new gradient via CMS, update `tailwind.config.ts` manually or regenerate the config.

## Best Practices

1. **Always use semantic tokens**: Use `bg-primary` not `bg-purple-500`
2. **Use CMS for all colors**: Never hardcode color values
3. **Test across themes**: Verify colors work in light/dark mode
4. **Provide descriptions**: Document gradient use cases in CMS
5. **Sort order matters**: Lower numbers appear first in dropdowns
6. **Use optimal_text_color**: Ensures readability on gradients

## Troubleshooting

### Gradient not showing in edit modal

1. Check if `active = true` in database
2. Verify `preview_class` matches Tailwind class
3. Run `SELECT * FROM color_tokens WHERE active = true` to debug

### Icon background not editable

1. Ensure you're using `<EditableIcon>` component
2. Verify edit mode is enabled
3. Check browser console for errors

### Colors not loading

1. Check `useColorSystem` for errors
2. Verify Supabase RLS policies allow SELECT on `color_tokens`
3. Check network tab for failed requests

## Future Enhancements

- Auto-generate Tailwind config from database
- Color accessibility checker in CMS
- Theme preview mode
- Color palette export/import

## Related Files

- `src/hooks/useColorSystem.ts` - Main hook for loading colors
- `src/hooks/useAllowedBackgrounds.ts` - Helper for background lists
- `src/hooks/useIconStyle.ts` - Icon-specific styling
- `src/components/EditableIcon.tsx` - Icon wrapper component
- `src/components/design-system/EditableColorSystem.tsx` - CMS UI
- `tailwind.config.ts` - Tailwind gradient definitions
- `src/config/colorSystem.ts` - **DEPRECATED** (legacy reference only)

---

**Questions?** Contact the development team or refer to the main project documentation.
