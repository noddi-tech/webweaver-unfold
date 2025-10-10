# i18n System - Deployment Guide

## Pre-Deployment Checklist

### 1. Verify Database State

Run these queries in Supabase SQL Editor:

```sql
-- Check total translations per language
SELECT 
  language_code,
  COUNT(*) as total_keys,
  SUM(CASE WHEN approved THEN 1 ELSE 0 END) as approved_keys
FROM translations
GROUP BY language_code
ORDER BY language_code;

-- Check for missing keys (keys that exist in EN but not in other languages)
WITH en_keys AS (
  SELECT DISTINCT translation_key
  FROM translations
  WHERE language_code = 'en'
)
SELECT 
  l.code as language,
  COUNT(DISTINCT ek.translation_key) as missing_keys
FROM languages l
CROSS JOIN en_keys ek
LEFT JOIN translations t ON t.translation_key = ek.translation_key AND t.language_code = l.code
WHERE l.enabled = true
  AND l.code != 'en'
  AND t.id IS NULL
GROUP BY l.code
ORDER BY missing_keys DESC;

-- Verify language settings
SELECT * FROM language_settings;
```

**Expected Results**:
- ✅ English: 455+ keys, all approved
- ⚠️ Other languages: Need AI translation if keys are missing

### 2. Code Verification

Check that all components use proper i18n:

```bash
# Search for hardcoded text (should return minimal results)
grep -r "\"[A-Z][a-z]" src/components --include="*.tsx" --include="*.ts" | grep -v "t(" | grep -v "className" | grep -v "type" | wc -l

# Verify all Link usages are LanguageLink
grep -r "<Link " src/components --include="*.tsx" | wc -l
# Should be 0 or very few

# Verify useAppTranslation usage
grep -r "useAppTranslation" src/components --include="*.tsx" | wc -l
# Should be 35+
```

## Deployment Steps

### Step 1: Run AI Translation

This is the **CRITICAL FIRST STEP** after code deployment.

1. **Access Translation Manager**
   ```
   Navigate to: /cms/translations
   ```

2. **Start AI Translation**
   - Click "AI Translate All Languages" button
   - Wait for process to complete (may take 2-5 minutes)
   - Monitor progress in UI

3. **What Happens**
   - System finds all approved English keys
   - Translates to all enabled languages
   - Creates new translation records
   - Marks as pending approval

4. **Expected Output**
   ```
   Translated 455 keys → German (de)
   Translated 455 keys → French (fr)
   Translated 455 keys → Italian (it)
   Translated 455 keys → Spanish (es)
   ... (for all enabled languages)
   ```

### Step 2: Review AI Translations

1. **Select Language Tab**
   - Click on "German" (de) tab
   - Review translated content

2. **Check Key Translations**
   - Homepage hero title
   - Navigation items
   - CTA buttons
   - Feature descriptions

3. **Look For Issues**
   - ❌ Technical terms mistranslated
   - ❌ Brand names changed
   - ❌ Obvious grammar errors
   - ❌ Context misunderstanding

4. **Edit if Needed**
   - Click in text area
   - Make corrections
   - Press Save (auto-saves)

### Step 3: Approve Translations

1. **Bulk Approve Good Translations**
   - Review each translation
   - Click ✓ to approve
   - Or click ✗ to reject

2. **Priority Order**
   - Homepage translations first
   - Navigation and CTAs
   - Main page content
   - Secondary pages

3. **Quality Threshold**
   - Approve if 90%+ accurate
   - Edit then approve if minor issues
   - Reject if major issues

**Goal**: Get to 100% approval for launch languages

### Step 4: Enable Languages

1. **Language Settings**
   ```
   Navigate to: CMS → Language Settings
   ```

2. **Enable Launch Languages**
   - ✅ English (already default)
   - ✅ German (if translations approved)
   - ✅ French (if translations approved)
   - ✅ Add others as ready

3. **Configure Display**
   - ✅ Show language switcher in header
   - ✅ Show language switcher in footer
   - ✅ Enable browser detection (recommended)

### Step 5: Test Live Site

1. **Test Each Language**
   ```
   Visit: yourdomain.com/en/
   Visit: yourdomain.com/de/
   Visit: yourdomain.com/fr/
   ```

2. **Quick Smoke Test**
   - Homepage loads
   - Content in correct language
   - Language switcher works
   - Navigation works
   - CTA buttons work
   - No console errors

3. **Mobile Test**
   - Test on mobile device
   - Verify responsive layout
   - Check language switcher accessibility

### Step 6: Monitor & Iterate

1. **Watch Metrics**
   - Track language usage in analytics
   - Monitor error rates
   - Check user feedback

2. **Iterate on Translations**
   - Fix reported issues
   - Improve unclear translations
   - Add missing content

3. **Add More Languages**
   - Enable additional languages
   - Run AI translation
   - Review and approve

## Deployment Scenarios

### Scenario A: Soft Launch (Recommended)

**Best for**: First i18n launch, testing with real users

1. Enable English only initially
2. Add German (most translation ready)
3. Monitor for 1 week
4. Add French, Italian
5. Monitor for 1 week
6. Add remaining languages
7. Full launch

**Advantages**:
- Lower risk
- Easier to fix issues
- Gradual rollout
- Better monitoring

### Scenario B: Full Launch

**Best for**: High confidence, all translations reviewed

1. AI translate all languages
2. Review all translations (time-intensive)
3. Approve all translations
4. Enable all languages
5. Launch simultaneously

**Advantages**:
- Immediate full coverage
- Single launch event
- Marketing opportunity

**Risks**:
- Higher chance of issues
- More translations to monitor
- Harder to troubleshoot

### Scenario C: Phased by Market

**Best for**: International expansion strategy

**Phase 1: Core Markets**
- English (en)
- German (de)
- French (fr)

**Phase 2: Secondary Markets**
- Spanish (es)
- Italian (it)
- Portuguese (pt)

**Phase 3: Expansion Markets**
- Dutch (nl)
- Polish (pl)
- Swedish (sv)
- etc.

## Common Issues & Solutions

### Issue: Translations Not Appearing

**Symptoms**:
- English text shows even when on /de/
- Translation key shows instead of text

**Solutions**:
1. Check if translations approved in database
2. Hard refresh browser (Ctrl+F5)
3. Check browser console for errors
4. Verify i18n loaded in DevTools Network tab

```sql
-- Check if translation exists and is approved
SELECT * FROM translations 
WHERE translation_key = 'homepage.hero.title' 
AND language_code = 'de';
-- Should show: approved = true
```

### Issue: Language Switcher Not Visible

**Symptoms**:
- No language switcher in header/footer

**Solutions**:
1. Check language settings
2. Verify multiple languages enabled
3. Check header/footer settings

```sql
-- Verify settings
SELECT * FROM language_settings;
-- show_language_switcher_header should be true
-- show_language_switcher_footer should be true

-- Check enabled languages
SELECT * FROM languages WHERE enabled = true;
-- Should show multiple languages
```

### Issue: AI Translation Failed

**Symptoms**:
- Error message in Translation Manager
- No new translations created

**Solutions**:
1. Check LOVABLE_API_KEY is configured
2. Check edge function logs in Supabase
3. Verify rate limits not exceeded
4. Retry translation

```bash
# Check edge function logs
# Go to: Supabase Dashboard → Edge Functions → translate-content → Logs
# Look for errors
```

### Issue: Broken Layout in Some Languages

**Symptoms**:
- Text overflow
- Buttons too small
- Cards misaligned

**Solutions**:
1. Check German translations (typically longest)
2. Add CSS for overflow handling
3. Adjust responsive breakpoints
4. Use shorter translation if necessary

```css
/* Add to components if needed */
.translation-container {
  word-break: break-word;
  overflow-wrap: anywhere;
}
```

### Issue: URLs Not Working

**Symptoms**:
- `/de/pricing` shows 404
- Links don't preserve language

**Solutions**:
1. Verify LanguageSync in router
2. Check LanguageLink usage
3. Verify route configuration

```typescript
// Check App.tsx has LanguageSync
<Route path="/:lang" element={<LanguageSync><Layout /></LanguageSync>}>
```

## Post-Deployment Monitoring

### Week 1: Active Monitoring

**Daily checks**:
- [ ] Check error logs
- [ ] Review user feedback
- [ ] Monitor analytics for language usage
- [ ] Test random pages in each language
- [ ] Check Translation Manager for issues

**Metrics to track**:
- Page views per language
- Bounce rate per language
- Language switcher usage
- Error rate per language

### Week 2-4: Stabilization

**Weekly checks**:
- [ ] Review translation quality reports
- [ ] Update poor translations
- [ ] Add missing translations
- [ ] Monitor performance metrics

**Improvements**:
- Fix reported translation issues
- Optimize poorly performing languages
- Add content for popular languages

### Month 2+: Optimization

**Monthly checks**:
- [ ] Translation quality audit
- [ ] User feedback review
- [ ] Analytics deep dive
- [ ] Content gap analysis

**Strategic actions**:
- Add new languages based on demand
- Improve SEO per language
- Professional translation for key pages
- A/B test translations

## Rollback Procedures

### Immediate Rollback (Critical Issues)

If major issues are discovered:

1. **Disable Problematic Language**
   ```sql
   -- Disable specific language
   UPDATE languages 
   SET enabled = false 
   WHERE code = 'de';
   ```

2. **Force Default Language**
   ```sql
   -- Set all users to English temporarily
   UPDATE language_settings
   SET enable_browser_detection = false,
       default_language_code = 'en';
   ```

3. **Notify Users**
   - Display banner explaining issue
   - Provide timeline for fix
   - Offer English alternative

### Partial Rollback (Specific Page Issues)

If issue is isolated to one page:

1. **Revert Specific Translations**
   ```sql
   -- Unapprove problematic translations
   UPDATE translations
   SET approved = false
   WHERE page_location = 'pricing'
   AND language_code = 'de';
   ```

2. **Users see fallback English**
   - System automatically falls back
   - No additional action needed

3. **Fix and Re-approve**
   - Correct translations
   - Test thoroughly
   - Re-approve

## Success Criteria

### Minimum Launch Requirements

- [ ] English: 100% translations approved
- [ ] At least 1 additional language: 95%+ approved
- [ ] Language switcher functional
- [ ] All links preserve language context
- [ ] No console errors
- [ ] Mobile responsive
- [ ] SEO elements in place

### Ideal Launch State

- [ ] 3+ languages fully translated and approved
- [ ] Professional review of key pages
- [ ] All edge cases tested
- [ ] Analytics configured
- [ ] Support team trained
- [ ] Documentation complete

### Long-term Goals

- [ ] 10+ languages supported
- [ ] 99%+ approval rate per language
- [ ] < 1% translation error rate
- [ ] Professional translators for key markets
- [ ] Automated translation testing
- [ ] User feedback loop established

## Support Resources

### During Deployment

**Technical Issues**:
- Check `/docs/i18n-guide.md`
- Review `/docs/i18n-quick-reference.md`
- Search codebase for examples

**Translation Issues**:
- Use Translation Manager UI
- Reference existing good translations
- Ask native speakers

**Emergency Contacts**:
- Development team
- Translation coordinator
- Product owner

### After Deployment

**Ongoing Support**:
- Translation Manager for updates
- Analytics for monitoring
- User feedback channels
- Monthly review meetings

---

**Status**: Ready for Deployment  
**Last Updated**: January 10, 2025  
**Owner**: Development Team  
**Next Review**: Post-deployment Week 1
