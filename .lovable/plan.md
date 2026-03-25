

# Database-Driven Testimonial from Customer Stories

## What
Replace the hardcoded translation-key-based testimonial with a database-driven component that pulls its quote from `customer_stories`. Add a "Testimonials" tab in the CMS to select which story's quote appears on the homepage. Show a "Read more" link to the story page.

## How it works

The `customer_stories` table already has `quote_text`, `quote_author`, `quote_author_title`, `company_name`, and `company_logo_url`. Instead of duplicating this data via translation keys, the homepage testimonial will fetch directly from a selected customer story.

## Database

**New table: `testimonial_settings`** (single-row config)

| Column | Type | Default |
|---|---|---|
| id | uuid | gen_random_uuid() |
| customer_story_id | uuid (FK → customer_stories.id) | null |
| active | boolean | true |
| created_at / updated_at | timestamptz | now() |

RLS: everyone can SELECT, admins can ALL.

When `customer_story_id` is set, the testimonial component fetches that story's quote fields + company logo. If null, falls back to hardcoded defaults.

## Component: `CustomerTestimonial.tsx`

- Replace translation-key approach with a `useQuery` that joins `testimonial_settings` → `customer_stories` to get: `quote_text`, `quote_author`, `quote_author_title`, `company_name`, `company_logo_url`, `slug`
- Use `company_logo_url` from the story as the avatar image (this is often the same logo used in the marquee — e.g. Trønderdekk)
- Add a "Read the full story →" link below the attribution, linking to `/:lang/stories/:slug`
- Keep eyebrow label as `EditableTranslation` (it's section chrome, not story data)
- Show skeleton while loading

## CMS: `TestimonialManager.tsx` (new)

Simple manager with:
- Dropdown to select a customer story (fetches all active stories)
- Preview of the selected quote, author, and logo
- Save button that upserts into `testimonial_settings`

## Admin page: `Admin.tsx`

- Add "Testimonials" tab trigger after "Stories" in the CMS → Content Management tab list
- Render `<TestimonialManager />` in corresponding `TabsContent`

## Files

| File | Change |
|---|---|
| Migration | Create `testimonial_settings` table with RLS |
| `src/components/design-system/TestimonialManager.tsx` | New — story picker + preview |
| `src/components/CustomerTestimonial.tsx` | Rewrite to fetch from DB, add "Read more" link |
| `src/pages/Admin.tsx` | Add Testimonials tab + import |

