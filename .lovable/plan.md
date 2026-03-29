

# Add Customer Stories to Internal Hub

## Change — `src/pages/Internal.tsx`

1. Add `BookOpen` is already imported. Import `MessageSquare` (or reuse an existing icon like `Star`) for Stories.
2. Add two entries:
   - **Content Management** section: `{ title: "Stories Manager", description: "Manage customer stories", href: "/cms?tab=stories", icon: MessageSquare }`
   - **Pages (Public)** section: `{ title: "Stories", description: "Customer stories", href: "/en/stories", icon: MessageSquare }`

3. In `src/pages/Admin.tsx` — add `stories` to the `?tab=` mapping in `getDefaultTabs()`:
   - `?tab=stories` → main: `cms`, cms sub-tab: `stories` (or whichever sub-tab holds the StoriesManager)

Need to verify the correct CMS sub-tab name for stories.

## Files changed

| File | Change |
|------|--------|
| `src/pages/Internal.tsx` | Add Stories cards to Content Management and Pages sections |
| `src/pages/Admin.tsx` | Add `stories` mapping to `getDefaultTabs()` |

