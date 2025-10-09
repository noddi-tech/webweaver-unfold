# i18n Configuration

This directory contains the internationalization (i18n) configuration for the application.

## Files

### config.ts

Main i18n configuration file that:
- Initializes i18next with react-i18next
- Sets up Supabase backend for loading translations
- Configures language detection (URL > localStorage > browser)
- Enables real-time translation updates via Supabase

## How It Works

### 1. Translation Loading

Translations are loaded from Supabase `translations` table:
- Only approved translations (`approved = true`) are loaded
- Translations are organized by `language_code`
- Keys use dot notation (e.g., `hero.title`)

### 2. Language Detection

Priority order:
1. **URL path** - `/en/`, `/no/`, etc.
2. **localStorage** - `noddi-language` key
3. **Browser language** - `navigator.language`

### 3. Real-time Updates

Changes to translations in Supabase trigger automatic reloads:
```typescript
supabase
  .channel('translations-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'translations' }, () => {
    i18n.reloadResources();
  })
  .subscribe();
```

## Configuration

### Supported Languages

Defined in `config.ts`:
```typescript
supportedLngs: ['en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'sv', 'no', 'da', 'fi', 'cs', 'hu', 'ro', 'el']
```

### Fallback Language

```typescript
fallbackLng: 'en'
```

If a translation is missing in the current language, it falls back to English.

## Usage

The configuration is automatically loaded in `main.tsx`:

```typescript
import './i18n/config'
```

No additional setup is required in components—just use the `useAppTranslation` hook:

```typescript
import { useAppTranslation } from '@/hooks/useAppTranslation';

function MyComponent() {
  const { t } = useAppTranslation();
  return <h1>{t('page.title', 'Default Title')}</h1>;
}
```

## Backend Structure

### Supabase Backend

The custom Supabase backend converts database rows to i18next format:

**Database format:**
```
translation_key: "hero.title"
translated_text: "One platform. Every function."
```

**Converted to:**
```javascript
{
  hero: {
    title: "One platform. Every function."
  }
}
```

### Language Detection

Custom detector checks:
1. URL pathname (e.g., `/no/pricing` → `no`)
2. localStorage `noddi-language` key
3. Browser's `navigator.language`

## Modifying Configuration

### Adding a New Language

1. Add to `supportedLngs` in `config.ts`
2. Add to `languages` table in Supabase
3. Add translations for that language

### Changing Fallback Language

Update `fallbackLng` in `config.ts`:
```typescript
fallbackLng: 'de', // German instead of English
```

### Disabling Features

```typescript
// Disable real-time updates
// Comment out the Supabase subscription

// Disable React Suspense
react: {
  useSuspense: false, // Already disabled
}
```

## Troubleshooting

### Translations Not Loading

1. Check Supabase connection
2. Verify translations are approved in database
3. Check browser console for errors
4. Ensure `config.ts` is imported in `main.tsx`

### Language Not Detected

1. Check URL format (should be `/:lang/path`)
2. Verify localStorage key `noddi-language`
3. Check supported languages list

### Real-time Updates Not Working

1. Check Supabase Realtime is enabled
2. Verify channel subscription is active
3. Check for console errors

## Performance

### Initial Load

Translations are loaded on-demand when needed, not all at once.

### Caching

- Browser caches translations in memory
- localStorage stores user's language preference
- Supabase responses may be cached by the browser

### Optimization Tips

1. Keep translation keys organized and minimal
2. Use fallback text in components
3. Lazy load languages not immediately needed
4. Consider CDN for static translations (future enhancement)
