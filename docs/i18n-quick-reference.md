# i18n Quick Reference Guide

## Common Tasks

### 1. Add Translation to Existing Component

```typescript
// 1. Import the hook
import { useAppTranslation } from "@/hooks/useAppTranslation";

// 2. Use in component
export default function MyComponent() {
  const { t } = useAppTranslation();
  
  return (
    <div>
      <h1>{t('my_page.hero.title', 'Welcome to Our Site')}</h1>
      <p>{t('my_page.hero.subtitle', 'Default subtitle text')}</p>
    </div>
  );
}
```

### 2. Add Language-Aware Link

```typescript
import { LanguageLink } from "@/components/LanguageLink";

// Instead of:
<Link to="/contact">Contact</Link>

// Use:
<LanguageLink to="/contact">Contact</LanguageLink>
```

### 3. Add New Translation Key (CMS)

1. Go to `/cms/translations`
2. Click "Add New Translation"
3. Fill in:
   - **Translation Key**: `page.section.element`
   - **Page Location**: `homepage`, `pricing`, etc.
   - **English Text**: Your default text
4. Click Save
5. Use AI Translate for other languages

### 4. Add New Translation Key (Code)

Create migration:
```sql
INSERT INTO public.translations (translation_key, language_code, translated_text, approved, page_location) VALUES
('my_page.section.key', 'en', 'My English Text', true, 'my_page')
ON CONFLICT (translation_key, language_code) DO NOTHING;
```

### 5. Access Current Language

```typescript
const { currentLanguage, changeLanguage } = useAppTranslation();

console.log(currentLanguage); // 'en', 'de', etc.
changeLanguage('de'); // Switch to German
```

### 6. Conditional Content by Language

```typescript
const { currentLanguage, t } = useAppTranslation();

return (
  <div>
    <h1>{t('title', 'Title')}</h1>
    {currentLanguage === 'de' && (
      <p>Zusätzlicher deutscher Inhalt</p>
    )}
  </div>
);
```

### 7. Translate Content with Variables

```typescript
// Not yet implemented, but common pattern:
// Translation: "Welcome, {name}!"
// Usage would be: t('welcome', { name: 'John' })
```

### 8. Test Translation in Browser

```
# Change language in URL:
http://localhost:8080/en/      # English
http://localhost:8080/de/      # German
http://localhost:8080/fr/      # French
```

### 9. Enable/Disable Language

1. Go to CMS Language Settings
2. Toggle "Enabled" for language
3. Language appears/disappears from switcher

### 10. Set Default Language

1. Go to CMS Language Settings
2. Change "Default Language Code"
3. Save changes

## Key Naming Patterns

### Page Structure
```
page.section.element
```

### Examples
```typescript
// Homepage
'homepage.hero.title'
'homepage.hero.subtitle'
'homepage.features.title'

// Architecture page
'architecture.hero.title'
'architecture.principles.title'

// Functions page
'functions.hero.title'
'functions.core_loop.step_1.title'

// Components
'component_name.element'
'function_cards.function_1.title'
```

### Nested Elements
```typescript
// For complex structures
'functions.core_loop.step_1.title'
'functions.core_loop.step_1.description'

'architecture.principles.unified.title'
'architecture.principles.unified.description'
```

## Translation Manager Shortcuts

| Action | Location | Description |
|--------|----------|-------------|
| View all translations | `/cms/translations` | Main dashboard |
| Add new key | Click "Add New Translation" | Create new key |
| Search translations | Search box at top | Filter by text |
| Filter by language | Language tabs | View specific language |
| Approve translation | ✓ button | Mark as approved |
| Reject translation | ✗ button | Mark as rejected |
| AI translate all | "AI Translate" button | Auto-translate |
| Edit translation | Click in text area | Inline editing |

## Language Codes Reference

| Code | Language | Native Name |
|------|----------|-------------|
| en | English | English |
| de | German | Deutsch |
| fr | French | Français |
| es | Spanish | Español |
| it | Italian | Italiano |
| pt | Portuguese | Português |
| nl | Dutch | Nederlands |
| pl | Polish | Polski |
| sv | Swedish | Svenska |
| no | Norwegian | Norsk |
| da | Danish | Dansk |
| fi | Finnish | Suomi |
| cs | Czech | Čeština |
| hu | Hungarian | Magyar |
| ro | Romanian | Română |
| el | Greek | Ελληνικά |

## Debugging

### Translation Not Showing

1. **Check if key exists**: Go to `/cms/translations`, search for key
2. **Check if approved**: Ensure translation has ✓ approved status
3. **Check language enabled**: Verify language is enabled in settings
4. **Check browser cache**: Hard refresh (Ctrl+F5)
5. **Check console**: Look for i18n errors in browser console

### Language Not Switching

1. **Check LanguageLink usage**: Ensure using `LanguageLink` not `Link`
2. **Check LanguageSync**: Should wrap routes in main app
3. **Check URL structure**: Should have `/en/`, `/de/`, etc.
4. **Check localStorage**: `noddi-language` should update

### AI Translation Not Working

1. **Check LOVABLE_API_KEY**: Ensure secret is configured
2. **Check approved English keys**: AI only translates approved English
3. **Check edge function logs**: Look for errors in Supabase
4. **Check rate limits**: May hit API rate limits

## Best Practices

### ✅ Do

- Always provide fallback text in `t()` function
- Use semantic key names (`hero.title`, not `text1`)
- Keep translation keys organized by page
- Test translations in context before approving
- Use consistent terminology across translations
- Include page_location for better organization

### ❌ Don't

- Don't hardcode text in components (use `t()`)
- Don't use generic keys like `label1`, `text2`
- Don't mix languages in same key
- Don't forget to approve translations
- Don't use translation keys for dynamic CMS content
- Don't skip fallback text in `t()` calls

## Component Patterns

### Simple Text
```typescript
<h1>{t('page.title', 'Default Title')}</h1>
```

### With Typography Hook
```typescript
const { h1 } = useTypography();
const { t } = useAppTranslation();

<h1 className={h1}>{t('page.title', 'Title')}</h1>
```

### In Lists
```typescript
const items = [
  { key: 'item1', label: t('list.item_1', 'First') },
  { key: 'item2', label: t('list.item_2', 'Second') },
];

items.map(item => <li key={item.key}>{item.label}</li>)
```

### Dynamic Arrays
```typescript
const steps = [
  {
    title: t('steps.step_1.title', 'Step 1'),
    desc: t('steps.step_1.desc', 'Description 1'),
  },
  {
    title: t('steps.step_2.title', 'Step 2'),
    desc: t('steps.step_2.desc', 'Description 2'),
  },
];
```

## Testing Checklist

Before committing translations:

- [ ] All keys have fallback text
- [ ] Keys follow naming convention
- [ ] English version approved
- [ ] Tested in browser
- [ ] No console errors
- [ ] Layout doesn't break with long text
- [ ] Works on mobile
- [ ] Language switcher updates correctly

## Resources

- **Full Guide**: `/docs/i18n-guide.md`
- **Implementation Summary**: `/docs/i18n-implementation-summary.md`
- **Audit Report**: `/docs/translation-audit.md`
- **Checklist**: `/docs/i18n-checklist.md`
- **Translation Manager**: `/cms/translations`
- **Language Settings**: CMS → Language Settings

---

**Quick Help**: For immediate questions, check the translation manager UI or search this guide.
