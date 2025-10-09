# Internationalization (i18n) Guide

This guide explains how to use the multi-language system implemented in this application.

## Overview

The application uses:
- **i18next** for translation management
- **react-i18next** for React integration
- **Supabase** for storing translations
- **URL-based language routing** (e.g., `/en/`, `/no/`, `/de/`)

## Quick Start

### 1. Using Translations in Components

```typescript
import { useAppTranslation } from '@/hooks/useAppTranslation';

function MyComponent() {
  const { t } = useAppTranslation();
  
  return (
    <div>
      <h1>{t('hero.title', 'Default fallback text')}</h1>
      <p>{t('hero.subtitle', 'Another fallback')}</p>
    </div>
  );
}
```

### 2. Language-Aware Links

Always use `LanguageLink` instead of regular `Link` for internal navigation:

```typescript
import { LanguageLink } from '@/components/LanguageLink';

<LanguageLink to="/pricing">
  {t('nav.pricing', 'Pricing')}
</LanguageLink>
```

### 3. Adding New Translation Keys

#### Via Translation Manager UI
1. Navigate to `/cms/translations`
2. Click "Add Translation Key"
3. Enter:
   - Translation key (e.g., `pricing.title`)
   - English text
   - Page location (e.g., `pricing`)
4. Click "Add Translation"
5. Use "AI Translate All Languages" to auto-translate

#### Via Database Migration

```sql
INSERT INTO translations (translation_key, language_code, translated_text, approved, page_location) 
VALUES 
  ('pricing.title', 'en', 'Simple, transparent pricing', true, 'pricing'),
  ('pricing.subtitle', 'en', 'Choose the plan that fits your needs', true, 'pricing')
ON CONFLICT (translation_key, language_code) DO NOTHING;
```

## Translation Key Naming Convention

Use dot notation for hierarchical keys:

```
{page}.{section}.{element}
```

Examples:
- `hero.title` - Hero section title
- `hero.metrics.nps` - NPS metric in hero
- `pricing.plans.basic.title` - Basic plan title in pricing
- `nav.home` - Navigation link for home
- `common.book_demo` - Common button text
- `footer.copyright` - Footer copyright text

## Language Configuration

### Supported Languages

Currently configured languages (in `languages` table):
- English (en) - Default
- German (de)
- French (fr)
- Spanish (es)
- Italian (it)
- Portuguese (pt)
- Dutch (nl)
- Polish (pl)
- Swedish (sv)
- Norwegian (no)
- Danish (da)
- Finnish (fi)
- Czech (cs)
- Hungarian (hu)
- Romanian (ro)
- Greek (el)

### Language Settings

Configure in the `language_settings` table or via `/cms` UI:
- `enable_browser_detection` - Auto-detect user's browser language
- `show_language_switcher_header` - Show language switcher in header
- `show_language_switcher_footer` - Show language switcher in footer
- `default_language_code` - Fallback language (usually 'en')

## AI Translation

The system includes an AI-powered translation feature:

1. Go to `/cms/translations`
2. Ensure English translations are approved
3. Click "AI Translate All Languages"
4. The system will translate all approved English content to other enabled languages
5. Review and approve the translations

**Note:** AI translations use the Lovable AI gateway and follow the tone of voice defined in `content/brand/tov-noddi-tech.md`.

## URL Structure

All pages use language-prefixed URLs:

```
/en/           → English homepage
/no/pricing    → Norwegian pricing page
/de/contact    → German contact page
```

### Routing Configuration

Language-prefixed routes are defined in `App.tsx`:

```typescript
<Route path="/:lang" element={<LanguageSync><Index /></LanguageSync>} />
<Route path="/:lang/pricing" element={<LanguageSync><Pricing /></LanguageSync>} />
```

The `LanguageSync` wrapper ensures the i18n language matches the URL parameter.

## Components

### LanguageSwitcher

Displays available languages with flags:
- **Header variant**: Dropdown menu
- **Footer variant**: Horizontal list

```typescript
<LanguageSwitcher variant="header" />
<LanguageSwitcher variant="footer" />
```

### LanguageLink

Wraps React Router's `Link` to maintain language context:

```typescript
<LanguageLink to="/pricing">Pricing</LanguageLink>
// Renders: /en/pricing (if current lang is 'en')
```

### LanguageSync

Synchronizes URL language parameter with i18n state:

```typescript
<Route path="/:lang/page" element={<LanguageSync><Page /></LanguageSync>} />
```

## Custom Hook: useAppTranslation

Enhanced translation hook with fallback support:

```typescript
const { t, i18n, currentLanguage, changeLanguage } = useAppTranslation();

// Translate with fallback
const title = t('page.title', 'Default Title');

// Get current language
console.log(currentLanguage); // 'en', 'no', etc.

// Change language programmatically
changeLanguage('de');
```

## Translation Manager

Access at `/cms/translations` (requires authentication).

Features:
- View all translations by language
- Search translation keys
- Edit translations inline
- Approve/reject translations
- Add new translation keys
- AI translate all languages
- View translation statistics per language

## Best Practices

### 1. Always Provide Fallbacks

```typescript
// Good
t('hero.title', 'One platform. Every function.')

// Avoid (no fallback if translation missing)
t('hero.title')
```

### 2. Keep Keys Organized

Group related translations:
```
hero.title
hero.subtitle
hero.cta
hero.metrics.nps
hero.metrics.bookings
```

### 3. Mark Translations as Approved

Only approved English translations are used for AI translation:

```sql
UPDATE translations 
SET approved = true 
WHERE translation_key = 'hero.title' AND language_code = 'en';
```

### 4. Use Semantic Page Locations

Helps organize translations:
- `homepage` - Homepage content
- `pricing` - Pricing page
- `contact` - Contact page
- `global` - Shared across all pages

### 5. Test All Languages

After adding translations:
1. Switch to each language using the language switcher
2. Verify all content displays correctly
3. Check for layout issues with longer translations
4. Test RTL languages if applicable

## Troubleshooting

### Translations Not Appearing

1. Check if translations exist in database:
```sql
SELECT * FROM translations WHERE translation_key = 'your.key';
```

2. Verify translation is approved:
```sql
SELECT * FROM translations WHERE translation_key = 'your.key' AND approved = true;
```

3. Check current language:
```typescript
const { currentLanguage } = useAppTranslation();
console.log('Current language:', currentLanguage);
```

### Language Not Switching

1. Ensure language is enabled in `languages` table
2. Check URL includes language prefix (e.g., `/en/` not just `/`)
3. Verify `LanguageSync` wrapper is used in route

### AI Translation Not Working

1. Check `LOVABLE_API_KEY` is configured in Supabase secrets
2. Ensure source English translations are approved
3. Check edge function logs for errors: `/cms/translations` page shows errors

## Database Schema

### translations

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| translation_key | text | Dot-notation key (e.g., 'hero.title') |
| language_code | text | Language code (e.g., 'en', 'no') |
| translated_text | text | The translated content |
| approved | boolean | Whether translation is approved |
| approved_by | uuid | User who approved (nullable) |
| approved_at | timestamp | When approved (nullable) |
| page_location | text | Where used (e.g., 'homepage') |
| context | text | Additional context (nullable) |

### languages

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| code | text | ISO language code (e.g., 'en') |
| name | text | English name (e.g., 'English') |
| native_name | text | Native name (e.g., 'English') |
| flag_code | text | Country flag code (e.g., 'GB') |
| enabled | boolean | Whether language is active |
| is_default | boolean | Whether this is the default language |
| sort_order | integer | Display order |
| rtl | boolean | Right-to-left language |

### language_settings

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| default_language_code | text | Default language |
| fallback_language_code | text | Fallback language |
| enable_browser_detection | boolean | Auto-detect browser language |
| show_language_switcher_header | boolean | Show switcher in header |
| show_language_switcher_footer | boolean | Show switcher in footer |

## API Reference

### useAppTranslation()

```typescript
const {
  t,              // Translation function
  i18n,           // i18next instance
  currentLanguage,// Current language code
  changeLanguage  // Function to change language
} = useAppTranslation();
```

### LanguageLink Props

```typescript
interface LanguageLinkProps extends LinkProps {
  to: string;  // Destination path (will be prefixed with language)
  // ... all other Link props
}
```

### LanguageSwitcher Props

```typescript
interface LanguageSwitcherProps {
  variant?: 'header' | 'footer';  // Display style
}
```

## Examples

### Complete Component Example

```typescript
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { LanguageLink } from '@/components/LanguageLink';
import { Button } from '@/components/ui/button';

export function PricingPage() {
  const { t } = useAppTranslation();

  return (
    <div>
      <h1>{t('pricing.title', 'Simple, transparent pricing')}</h1>
      <p>{t('pricing.subtitle', 'Choose the plan that fits your needs')}</p>
      
      <div>
        <h2>{t('pricing.plans.basic.title', 'Basic Plan')}</h2>
        <p>{t('pricing.plans.basic.description', 'Perfect for small teams')}</p>
        <Button asChild>
          <LanguageLink to="/contact">
            {t('common.get_started', 'Get Started')}
          </LanguageLink>
        </Button>
      </div>
    </div>
  );
}
```

## Support

For questions or issues with the i18n system:
1. Check this documentation
2. Review the Translation Manager at `/cms/translations`
3. Check console for i18n errors
4. Review Supabase edge function logs
