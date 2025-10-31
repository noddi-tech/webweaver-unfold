# Edit Mode Implementation Guide

## Architecture Overview

The edit mode feature is built with a modular, scalable architecture using React Context and composable wrapper components.

### Core Components

1. **EditModeContext** (`src/contexts/EditModeContext.tsx`)
   - Global state management for edit mode
   - Single source of truth for edit state
   - Used by all editable components

2. **Wrapper Components** (Composable)
   - `EditableTranslation` - For i18n translated text
   - `EditableText` - For CMS text_content table
   - `EditableSolutionText` - For solutions table text
   - `EditableKeyBenefit` - For solution key benefits
   - `EditableImage` - For images with upload/library/URL options
   - `EditableButton` - For buttons (text + URL)
   - `LockedText` - For hard-coded values (shows lock icon)

3. **Modal Components** (Reusable)
   - `TranslationEditModal` - Edits translations with multi-language support
   - `SolutionEditModal` - Edits solution-specific fields
   - `KeyBenefitEditModal` - Edits key benefit JSONB data
   - `ImageEditModal` - Upload/select/URL for images
   - `ButtonEditModal` - Edit button text and URL

## Usage Patterns

### Pattern 1: Translation-based Content
```tsx
import { EditableTranslation } from '@/components/EditableTranslation';

<EditableTranslation translationKey="hero.title">
  <h1>{t('hero.title', 'Default text')}</h1>
</EditableTranslation>
```

### Pattern 2: CMS Text Content
```tsx
import { EditableText } from '@/components/EditableText';

<EditableText 
  contentId={content.id} 
  translationKey="optional.key"
>
  <p>{content.text}</p>
</EditableText>
```

### Pattern 3: Database Table Fields
```tsx
import { EditableSolutionText } from '@/components/EditableSolutionText';

<EditableSolutionText 
  solutionId={id} 
  field="hero_title"
  onSave={handleRefresh}
>
  <h1>{solution.hero_title}</h1>
</EditableSolutionText>
```

### Pattern 4: Images
```tsx
import { EditableImage } from '@/components/EditableImage';

<EditableImage
  imageUrl={url}
  onSave={(newUrl) => handleImageUpdate(newUrl)}
  altText="Description"
  placeholder="Add image"
  aspectRatio="16/9"
>
  {url ? <img src={url} alt="..." /> : null}
</EditableImage>
```

### Pattern 5: Buttons
```tsx
import { EditableButton } from '@/components/EditableButton';

<EditableButton
  buttonText={ctaText}
  buttonUrl={ctaUrl}
  onSave={(text, url) => handleButtonUpdate(text, url)}
>
  <Button>
    <Link to={ctaUrl}>{ctaText}</Link>
  </Button>
</EditableButton>
```

### Pattern 6: Hard-coded Content
```tsx
import { LockedText } from '@/components/LockedText';

<LockedText reason="Metric value - Update in code">
  <div>NPS 90</div>
</LockedText>
```

## Adding Edit Mode to New Components

### Step 1: Import Required Components
```tsx
import { EditableTranslation } from '@/components/EditableTranslation';
import { LockedText } from '@/components/LockedText';
```

### Step 2: Wrap Content
Identify content types:
- **Translated** → Use `EditableTranslation`
- **CMS** → Use `EditableText`
- **Database** → Use specific editable component
- **Hard-coded** → Use `LockedText`

### Step 3: Test
1. Enable edit mode via user menu
2. Hover over content to see edit icons
3. Click to edit and verify save functionality

## Principles

### 1. Separation of Concerns
- Each wrapper component handles ONE content type
- Modal components are reusable across wrappers
- Edit mode state is centralized

### 2. Composability
- Wrappers accept children for maximum flexibility
- No styling in wrappers - preserve existing design
- Easy to nest and combine

### 3. Scalability
- Add new content types by creating new wrapper
- Modals can be shared between wrappers
- Context ensures consistent behavior

### 4. User Experience
- Hover shows edit icon
- Click opens modal with intuitive UI
- Lock icon for non-editable content
- No page reload when possible

## Data Flow

```
User Action (hover/click)
  ↓
Wrapper Component (EditableX)
  ↓
Modal Component (XEditModal)
  ↓
Supabase Update
  ↓
State Refresh (via callback or reload)
  ↓
UI Update
```

## Best Practices

1. **Always provide translation keys** for translated content
2. **Use callbacks** for refreshes instead of full page reloads when possible
3. **Add lock icons** for content that should be visible but not editable
4. **Keep wrapper components thin** - logic belongs in modals
5. **Test in edit mode** after adding new components
6. **Document new patterns** when creating custom wrappers

## Future Enhancements

- [ ] Bulk edit mode for multiple items
- [ ] Inline editing without modals
- [ ] Edit history and versioning
- [ ] Permission-based editing (roles)
- [ ] Preview changes before saving
- [ ] Undo/redo functionality
