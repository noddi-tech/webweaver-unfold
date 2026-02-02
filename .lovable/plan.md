

# Add Language Delete Functionality to CMS Translations Tab

## Problem Identified

The `/cms` Admin page has a "Translations & SEO" section with 4 tabs:
- 📊 Overview
- 🌍 Translations  
- 🚀 SEO & Meta
- 🗺️ Sitemap

The **⚙️ Settings tab** (containing `LanguageVisibilityManager` with the delete language functionality) is **missing** from this view. It only exists on the separate `TranslationManager.tsx` page at `/cms/translations`, which currently redirects to `/cms`.

## Solution

Add the Settings tab to the Admin.tsx translations section so you can delete languages directly from `/cms`.

## Technical Changes

### File: `src/pages/Admin.tsx`

| Change | Description |
|--------|-------------|
| Import `LanguageVisibilityManager` | Already imported at line 6 in TranslationManager.tsx, needs to be added to Admin.tsx |
| Add Settings tab trigger | Add `<TabsTrigger value="settings">⚙️ Settings</TabsTrigger>` to the TabsList |
| Add Settings tab content | Add `<TabsContent value="settings"><LanguageVisibilityManager /></TabsContent>` |
| Update grid cols | Change `grid-cols-4` to `grid-cols-5` in the TabsList |

### Changes Summary

```text
BEFORE (Admin.tsx lines 432-458):
┌──────────────────────────────────────────────┐
│ Translations & SEO Tab                        │
│ ┌──────────────────────────────────────────┐ │
│ │ 📊 Overview │ 🌍 Translations │ 🚀 SEO │ 🗺️ │ │
│ └──────────────────────────────────────────┘ │
│ (No Settings tab - can't delete languages)   │
└──────────────────────────────────────────────┘

AFTER:
┌──────────────────────────────────────────────┐
│ Translations & SEO Tab                        │
│ ┌──────────────────────────────────────────┐ │
│ │ 📊 │ 🌍 │ 🚀 SEO │ 🗺️ │ ⚙️ Settings │     │ │
│ └──────────────────────────────────────────┘ │
│ Settings tab contains:                        │
│ - Auto-translate toggle                       │
│ - Language visibility switches                │
│ - 🗑️ Delete language buttons (red trash icon)│
└──────────────────────────────────────────────┘
```

## How to Delete Greek After Implementation

1. Go to `/cms`
2. Click **"Translations & SEO"** tab
3. Click **"⚙️ Settings"** sub-tab
4. Find Greek in the language list
5. Click the **red trash icon** 🗑️
6. Type "Greek" to confirm
7. Click "Delete Permanently"

This will remove:
- All 683 Greek translation entries
- Evaluation data for Greek
- Page meta translations for Greek
- The Greek language configuration

