# i18n Verification & Testing Checklist

## Pre-Launch Verification

Use this checklist to verify the i18n system is working correctly before launch.

### Database Verification

#### 1. Check Translation Keys Exist

```sql
-- Run in Supabase SQL Editor to verify all keys are present
SELECT 
  page_location,
  COUNT(*) as key_count,
  COUNT(DISTINCT translation_key) as unique_keys
FROM translations
WHERE language_code = 'en'
GROUP BY page_location
ORDER BY page_location;

-- Expected results:
-- homepage: ~150 keys
-- architecture: ~50 keys
-- functions: ~85 keys
-- partners: ~40 keys
-- pricing: ~25 keys
-- contact: ~15 keys (if exists)
```

- [ ] All expected page_locations present
- [ ] Key counts match expectations
- [ ] No duplicate keys per language

#### 2. Verify English Translations Approved

```sql
-- Check approval status of English translations
SELECT 
  COUNT(*) as total_keys,
  SUM(CASE WHEN approved THEN 1 ELSE 0 END) as approved_keys,
  SUM(CASE WHEN NOT approved THEN 1 ELSE 0 END) as pending_keys
FROM translations
WHERE language_code = 'en';
```

- [ ] All English keys approved
- [ ] No pending English keys
- [ ] Total matches expected ~455+ keys

#### 3. Check Language Configuration

```sql
-- Verify enabled languages
SELECT code, name, native_name, enabled, is_default
FROM languages
ORDER BY sort_order;
```

- [ ] All desired languages enabled
- [ ] One language marked as default (English)
- [ ] Sort order is correct

### UI Testing

#### Homepage Tests

1. **Hero Section**
   - [ ] `/en/` shows English hero title
   - [ ] `/de/` shows German hero title (after AI translation)
   - [ ] `/fr/` shows French hero title (after AI translation)
   - [ ] Hero subtitle translates
   - [ ] CTA buttons translate
   - [ ] USP pills translate

2. **Features Section**
   - [ ] Feature cards display in correct language
   - [ ] Icons show correctly
   - [ ] Hover effects work
   - [ ] No layout breaks with long text

3. **WhyItMatters Section**
   - [ ] Before/after comparison translates
   - [ ] All benefit points translate
   - [ ] CTA button translates

4. **CustomerJourney**
   - [ ] All journey steps translate
   - [ ] Timeline visualization works
   - [ ] Mobile responsive

5. **HowItWorks**
   - [ ] All process steps translate
   - [ ] Arrow connectors display
   - [ ] Caption text translates

6. **FinalCTA**
   - [ ] Title translates
   - [ ] Subtitle translates
   - [ ] Both buttons translate
   - [ ] Links preserve language

#### Architecture Page Tests

1. **ArchitectureHero**
   - [ ] `/en/architecture` shows English
   - [ ] `/de/architecture` shows German
   - [ ] CTA button translates

2. **ArchitecturePrinciples**
   - [ ] All 6 principles translate
   - [ ] Icons display correctly
   - [ ] Grid layout maintains

3. **ArchitectureDiagram**
   - [ ] All 4 layers translate
   - [ ] Arrow indicators show
   - [ ] Footer text translates

4. **IntegrationOverview**
   - [ ] All 4 integrations translate
   - [ ] Icons render properly

#### Functions Page Tests

1. **FunctionsHero**
   - [ ] Title translates
   - [ ] Both CTAs translate
   - [ ] Links work correctly

2. **CoreLoop**
   - [ ] All 5 steps translate
   - [ ] Icons display
   - [ ] Footer text translates

3. **FunctionCards**
   - [ ] All 7 function cards translate
   - [ ] Collapsible functionality works
   - [ ] Feature lists translate
   - [ ] Long text doesn't break layout

#### Partners Page Tests

1. **PartnersHero**
   - [ ] Title translates
   - [ ] Subtitle translates
   - [ ] CTA translates

2. **PartnershipModel**
   - [ ] All 4 benefits translate
   - [ ] Title/subtitle translate
   - [ ] CTA button translates

3. **CaseStudies**
   - [ ] All 3 cases translate
   - [ ] Before/after labels translate
   - [ ] Footer text translates

4. **ProofMetrics**
   - [ ] All 6 metrics translate
   - [ ] Headlines translate
   - [ ] Context text translates

#### Pricing Page Tests

1. **PricingHero**
   - [ ] Title from CMS displays
   - [ ] Subtitle displays
   - [ ] USPs display

2. **StaticPricingExamples**
   - [ ] All 4 examples translate
   - [ ] Example labels translate
   - [ ] Revenue labels translate
   - [ ] Annual cost label translates
   - [ ] Disclaimer translates

### Navigation & Layout Tests

#### Language Switcher

1. **Header Language Switcher**
   - [ ] Appears when enabled
   - [ ] Shows all enabled languages
   - [ ] Current language highlighted
   - [ ] Switching updates URL
   - [ ] Switching updates content
   - [ ] Flag icons display (if used)

2. **Footer Language Switcher**
   - [ ] Appears when enabled
   - [ ] Functions same as header
   - [ ] Maintains consistency

#### Language Links

1. **Internal Navigation**
   - [ ] All `LanguageLink` components work
   - [ ] Links preserve current language
   - [ ] `/en/pricing` → stays in English
   - [ ] `/de/pricing` → stays in German
   - [ ] No broken links

2. **URL Structure**
   - [ ] Root redirects to default language
   - [ ] `/` → `/en/` (or default)
   - [ ] Language prefix in all URLs
   - [ ] Clean URLs (no double slashes)

### Fallback Testing

#### Missing Translations

1. **Unapproved Translations**
   - [ ] Falls back to English
   - [ ] No blank/empty text
   - [ ] Console shows warning (dev mode)

2. **Missing Keys**
   - [ ] Shows translation key (dev)
   - [ ] Shows fallback text (prod)
   - [ ] No app crashes

#### Browser Language Detection

1. **First Visit**
   - [ ] Detects browser language
   - [ ] Redirects to detected language
   - [ ] Falls back to English if unsupported

2. **Stored Preference**
   - [ ] Remembers user selection
   - [ ] localStorage saves choice
   - [ ] Overrides browser detection

### Mobile Responsiveness

Test on multiple screen sizes:

#### Mobile (320px - 768px)
- [ ] Hero section readable
- [ ] Feature cards stack properly
- [ ] Language switcher accessible
- [ ] No horizontal scrolling
- [ ] Buttons properly sized
- [ ] Text doesn't overflow

#### Tablet (768px - 1024px)
- [ ] Grid layouts adjust correctly
- [ ] Navigation compact but usable
- [ ] Cards in 2-column grid
- [ ] Images scale properly

#### Desktop (1024px+)
- [ ] Full-width layouts work
- [ ] Multi-column grids display
- [ ] Hover effects functional
- [ ] Proper spacing maintained

### Performance Testing

#### Load Times

Test with browser DevTools Network tab:

- [ ] English page loads < 2s
- [ ] Language switch < 500ms
- [ ] Translation load < 100ms
- [ ] No layout shifts (CLS)
- [ ] Images load progressively

#### Bundle Size

Check in DevTools:

- [ ] Total JS bundle reasonable
- [ ] i18n libraries gzipped
- [ ] No duplicate translations loaded
- [ ] Lazy loading works (if implemented)

### Browser Compatibility

Test in multiple browsers:

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### SEO Verification

#### Meta Tags

Check with browser inspector:

- [ ] `<html lang="en">` updates per language
- [ ] Page title translates
- [ ] Meta description translates (if implemented)
- [ ] Canonical URLs correct
- [ ] hreflang tags present (if implemented)

#### URL Structure

- [ ] Clean URLs (no query params for language)
- [ ] Proper HTTP status codes
- [ ] No redirect loops
- [ ] Sitemap includes all languages (if exists)

### Content Quality

#### Translation Accuracy

After AI translation, manually verify:

- [ ] Technical terms correct
- [ ] Brand names unchanged
- [ ] Tone/voice consistent
- [ ] No obvious mistranslations
- [ ] Context-appropriate wording

#### Layout Issues

Check for problems caused by translations:

- [ ] No text overflow
- [ ] No broken layouts
- [ ] Buttons fit text
- [ ] Card heights consistent
- [ ] No overlapping text

### Edge Cases

#### Long Text

Test with German (typically longest):

- [ ] Long compound words don't break layout
- [ ] Buttons accommodate text
- [ ] Cards expand properly
- [ ] Mobile layout handles length

#### Special Characters

Test with languages having special characters:

- [ ] Accents display correctly (é, ñ, ü)
- [ ] Non-Latin scripts work (if applicable)
- [ ] Proper encoding (UTF-8)
- [ ] No character corruption

#### RTL Languages

If Arabic/Hebrew enabled:

- [ ] Text direction reverses
- [ ] Layout mirrors correctly
- [ ] Icons/images flip appropriately
- [ ] Navigation order reverses

### Admin/CMS Testing

#### Translation Manager

- [ ] `/cms/translations` loads
- [ ] Can view all languages
- [ ] Can search/filter translations
- [ ] Can edit translations
- [ ] Can approve/reject
- [ ] Changes save correctly
- [ ] Real-time updates work

#### AI Translation

- [ ] AI Translate button visible
- [ ] Translation process completes
- [ ] New translations created
- [ ] Marked as pending approval
- [ ] Quality reasonable

#### Language Settings

- [ ] Can enable/disable languages
- [ ] Can set default language
- [ ] Can toggle language switcher
- [ ] Settings save properly

### Error Handling

#### Network Issues

Test with throttled connection:

- [ ] Graceful fallback if translation load fails
- [ ] Loading states shown
- [ ] Retry mechanism works
- [ ] User informed of issues

#### Invalid URLs

- [ ] `/invalid-lang/` redirects properly
- [ ] 404 page translates
- [ ] Error messages translate

## Automated Testing Script

Create this test file: `e2e-tests/i18n.spec.ts`

```typescript
// Example Playwright test
import { test, expect } from '@playwright/test';

test.describe('i18n System', () => {
  test('Homepage displays in English', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('h1')).toContainText('One data model');
  });

  test('Language switcher changes language', async ({ page }) => {
    await page.goto('/en/');
    await page.click('[data-testid="language-switcher"]');
    await page.click('[data-lang="de"]');
    expect(page.url()).toContain('/de/');
  });

  test('Links maintain language context', async ({ page }) => {
    await page.goto('/de/');
    await page.click('a[href*="architecture"]');
    expect(page.url()).toContain('/de/architecture');
  });
});
```

## Issue Tracking Template

When issues are found, document them:

```markdown
### Issue: [Brief Description]

**Page**: Homepage / Architecture / etc.
**Language**: en / de / fr / etc.
**Component**: ComponentName
**Severity**: Critical / High / Medium / Low

**Description**:
[Detailed description of the issue]

**Steps to Reproduce**:
1. Go to /de/
2. Click on X
3. Observe Y

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Screenshots**:
[If applicable]

**Fix Required**:
- [ ] Code change
- [ ] Translation update
- [ ] Database migration
- [ ] Documentation update
```

## Sign-Off Checklist

Before launching to production:

- [ ] All database verifications passed
- [ ] All UI tests passed (5+ pages)
- [ ] Navigation works in all languages
- [ ] Fallbacks work correctly
- [ ] Mobile responsive in all languages
- [ ] Performance acceptable
- [ ] Browser compatibility verified
- [ ] SEO elements in place
- [ ] Content quality reviewed
- [ ] Edge cases handled
- [ ] Admin/CMS functional
- [ ] Error handling works
- [ ] Documentation complete
- [ ] Team trained on system
- [ ] Backup plan established

## Rollback Plan

If issues arise post-launch:

1. **Immediate**: Disable problematic languages
2. **Short-term**: Revert to English only
3. **Investigation**: Check logs and database
4. **Fix**: Apply necessary corrections
5. **Re-test**: Complete checklist again
6. **Re-launch**: Enable languages gradually

---

**Verification Status**: ⏳ Pending  
**Last Updated**: January 10, 2025  
**Next Review**: Before Production Deploy
