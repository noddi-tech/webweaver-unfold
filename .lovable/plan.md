

# Replace Avatar Initials with Company Logo

## Change
Replace the hardcoded "TD" initials avatar with an `AvatarImage` that loads the company logo URL from a CMS-editable translation key. Keep `AvatarFallback` with the company initials as a loading/error fallback.

## In `src/components/CustomerTestimonial.tsx`

- Import `AvatarImage` from `@/components/ui/avatar`
- Add `EditableImage` or simply use `t('testimonial.company_logo_url', '/placeholder.svg')` to get the logo URL
- Replace the current `Avatar` block with:
  ```tsx
  <Avatar className="h-14 w-14">
    <AvatarImage 
      src={t('testimonial.company_logo_url', '/placeholder.svg')} 
      alt={t('testimonial.company_name', 'Trønderdekk')} 
    />
    <AvatarFallback className="bg-muted text-muted-foreground text-lg font-semibold">
      TD
    </AvatarFallback>
  </Avatar>
  ```
- Wrap the Avatar in `EditableTranslation` with key `testimonial.company_logo_url` so the logo URL can be updated via CMS

## Files

| File | Change |
|---|---|
| `src/components/CustomerTestimonial.tsx` | Add AvatarImage with CMS-editable logo URL |

