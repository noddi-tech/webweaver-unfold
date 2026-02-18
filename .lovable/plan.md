

# Legal Documents CMS Feature

## Overview

Add a full Legal section to the CMS where you can create and manage Privacy Policy, Terms of Service, Cookie Policy, and Data Processor Agreement (DPA). The Privacy Policy and Terms of Service support versioning with editable dates. The DPA is linked from within the ToS, not as a separate footer link. Public-facing legal pages will render the content with proper formatting.

## What You'll Get

- **CMS > Content Management > Legal** tab with editors for all 4 document types
- **Privacy Policy & Terms of Service** with version history (last updated dates, ability to create new versions)
- **Cookie Policy** as a single editable document
- **Data Processor Agreement (DPA)** as a single editable document, linked from within the ToS content
- **Public pages** at `/:lang/privacy`, `/:lang/terms`, `/:lang/cookies` rendering the latest published version
- **Footer links** updated to point to the correct routes (no separate DPA link in footer)

## Database Design

### New table: `legal_documents`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| document_type | text | `privacy_policy`, `terms_of_service`, `cookie_policy`, `data_processor_agreement` |
| title | text | Document title |
| content | text | Rich text / markdown content |
| version_label | text | e.g. "v2.0", "January 2026" |
| effective_date | date | When this version takes effect |
| last_updated | timestamptz | Last modified date (editable) |
| published | boolean | Whether this version is the active/public one |
| sort_order | integer | For ordering versions |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto |

RLS: Public SELECT for published documents, admin ALL.

## Implementation Steps

### 1. Database Migration
Create the `legal_documents` table with RLS policies and seed initial empty documents for all 4 types.

### 2. CMS Component: `LegalDocumentsManager.tsx`
New component under `src/components/design-system/` with:
- Tabs for each document type (Privacy Policy, Terms of Service, Cookie Policy, DPA)
- For Privacy Policy & ToS: version list showing effective dates, ability to add new version, mark one as published
- For Cookie Policy & DPA: single document editor
- Rich text editor using the existing `BlogRichTextEditor` pattern (markdown/HTML)
- Editable "last updated" date field and "effective date" field

### 3. Admin Integration
Add "Legal" tab trigger to the Content Management sub-tabs in `Admin.tsx`.

### 4. Public Legal Pages
Create `src/pages/LegalPage.tsx` - a single reusable page component that:
- Takes a `documentType` prop
- Fetches the latest published version from `legal_documents`
- Renders with Header, formatted content, version date, and Footer
- For ToS page: includes a link to the DPA

### 5. Routes
Add routes to `App.tsx`:
- `/:lang/privacy` -> LegalPage (privacy_policy)
- `/:lang/terms` -> LegalPage (terms_of_service)  
- `/:lang/cookies` -> LegalPage (cookie_policy)
- Redirect routes for non-prefixed paths

### 6. Footer Links Update
Update the footer_settings legal_links in the database to point to `/privacy`, `/terms`, `/cookies` instead of `#`. Remove any DPA link from footer (DPA is accessed via ToS only).

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `src/components/design-system/LegalDocumentsManager.tsx` | CMS editor for all legal documents |
| `src/pages/LegalPage.tsx` | Public-facing legal page renderer |

### Files to Modify
| File | Change |
|------|--------|
| `src/pages/Admin.tsx` | Add "Legal" tab to Content Management |
| `src/App.tsx` | Add `/:lang/privacy`, `/:lang/terms`, `/:lang/cookies` routes |

### Version Management (Privacy Policy & ToS)
- Each document type can have multiple rows (versions)
- Only one version per type can be `published = true` at a time
- Publishing a new version automatically unpublishes the previous one
- The public page always shows the version where `published = true`
- Version list shows effective_date, last_updated, and published status
- Old versions are kept for audit trail but not displayed publicly

