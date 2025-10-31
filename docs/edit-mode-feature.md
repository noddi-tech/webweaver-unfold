# Edit Mode Feature

## Overview
The Edit Mode feature allows authenticated users to edit text content directly from the frontend. When edit mode is enabled, hovering over editable text reveals a pencil icon that opens an editing modal.

## Components

### 1. EditModeContext (`src/contexts/EditModeContext.tsx`)
Provides global state for edit mode across the application.

```tsx
import { useEditMode } from '@/contexts/EditModeContext';

const { editMode, toggleEditMode, setEditMode } = useEditMode();
```

### 2. UserMenuDropdown (`src/components/UserMenuDropdown.tsx`)
Replaces the old sign-out button with a dropdown menu containing:
- Edit Mode toggle switch
- Sign out button
- User email display

### 3. EditableText (`src/components/EditableText.tsx`)
Wrapper component that makes text editable when edit mode is enabled.

```tsx
import { EditableText } from '@/components/EditableText';

<EditableText 
  contentId="uuid-of-content" 
  translationKey="optional.translation.key"
>
  <h1>Your editable text</h1>
</EditableText>
```

### 4. TranslationEditModal (`src/components/TranslationEditModal.tsx`)
Modal dialog for editing content with tabs for:
- Main content editing
- Translation editing (for all enabled languages)

## Usage

### Step 1: Sign in
Navigate to `/cms-login` and sign in with your credentials.

### Step 2: Enable Edit Mode
Click on your avatar in the header and toggle "Edit Mode" on.

### Step 3: Edit Content
Hover over any text wrapped with `<EditableText>` and click the pencil icon to edit.

### Step 4: Save Changes
Edit the content in the modal and click "Save Content". The page will refresh to show your changes.

## How to Make Content Editable

Wrap any text content with the `EditableText` component:

```tsx
import { EditableText } from '@/components/EditableText';
import { useTextContent } from '@/hooks/useTextContent';

function MyComponent() {
  const { textContent } = useTextContent('homepage', 'hero');
  const heroTitle = textContent.find(t => t.element_type === 'title');
  
  return (
    <EditableText 
      contentId={heroTitle.id}
      translationKey="hero.title"
    >
      <h1>{heroTitle.content}</h1>
    </EditableText>
  );
}
```

## Database Requirements

The feature works with:
- `text_content` table (for main content)
- `translations` table (for multilingual content)
- Requires authenticated user session

## Future Enhancements

- [ ] Inline editing without modal
- [ ] Markdown support
- [ ] Image editing
- [ ] Drag and drop reordering
- [ ] Permission-based editing (roles)
- [ ] Edit history and versioning
