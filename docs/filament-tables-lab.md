# Filament-style Tables Lab — React Playground (P0-10)

Open **/admin/filament-tables-lab** after signing in to the React Playground.
This page is a **UI behavior laboratory**, not an implementation of Filament or an assertion that every Filament 5 API is available in Lavertia.

## Architecture

- PHP Page: react/app/Lavertia/Pages/FilamentTablesLabPage.php
- PHP fixture component: react/app/Lavertia/Components/FilamentTablesLab.php
- React interactive component: react/resources/js/components/lavertia/filament-tables-lab.tsx
- React adapter integration: react/resources/js/components/lavertia/renderer.tsx
- Navigation: react/app/Providers/Lavertia/AdminPanelProvider.php
- Feature tests: react/tests/Feature/LavertiaFilamentTablesLabTest.php

## Try the reference scenarios

| Reference behavior | How to test it | Persistence |
| --- | --- | --- |
| Light and dark table | Switch the host Playground appearance | Host theme |
| Title, description, create action | Users / Blog posts tabs; New user / New post | Local demo |
| Search | Type in Search; instant substring match | Local demo |
| Column sorting | Click sortable headings; toggle direction | Local demo |
| Filters popover | Funnel icon, draft selections, Apply / Reset | Local demo |
| Column visibility | Columns icon, checkboxes | Local demo |
| Column ordering | Up/down buttons inside Columns | Local demo |
| Page size | 5 / 10 / 25 / 50 | Local demo |
| Numbered/simple pagination | All table options > Pagination | Local demo |
| Row and page selection | Checkboxes | Local demo |
| Select all filtered | Check a row, then Select all N | Local demo |
| Bulk verify / publish | Select sample rows > bulk button | Local demo |
| Bulk delete with confirmation | Select rows > Delete selected | Local demo |
| Create / Edit / View / Delete | Row actions and New user | Local demo |
| Feature / Unfeature | Blog posts > action | Local demo |
| Status badges and boolean icons | Blog posts / Users | Local demo |
| Grouping and collapsible groups | Group by Role/Verified/Status/Author | Local demo |
| Searchable compact Select controls | Open Group by, Role, Status or page size, type an option name; Enter selects, Escape closes | Local UI; Eloquent filters use server queries |
| Status-colored rows | Blog posts > All table options > Status-colored rows | Local demo |
| Striped/compact rows | All table options | Local demo |
| Skeleton rows | All table options > Skeleton loading | Local demo |
| Drag-and-drop ordering | Reordering tab, drag rows | Local demo |
| Keyboard/touch row ordering | Reordering tab on narrow viewport: move arrows | Local demo |
| CSV export | Download icon | Downloads only filtered demo records |
| Empty state | Filter/search a nonmatching string | Local demo |

The demo starts with 51 **fictitious** Users and 50 **fictitious** Blog Posts. Email addresses use example.test.

### Actual Lavertia Tables implementation

The pre-existing **/admin/tables-showcase** page remains the real framework contract:
Table::make, searchable TextColumns, SelectFilters, sortable columns, badge tones,
column manager and reordering, bounded snapshot rows, authorized tenant-scoped
Eloquent queries and server-side search/sort/filter/offset pagination.

**Not yet implemented as generic Lavertia package features:**
row actions with server authorization/mutations, bulk actions, inline editing,
server-persisted row ordering, server grouping, column summaries, export/import
policies, advanced ternary/query-builder filters, cursor pagination, and durable
user-specific column preferences. The new lab does **not** impersonate these APIs.

### Security

The lab runs after panel authentication. Every mutation is only to in-memory
React state. No POST/PUT/PATCH/DELETE request, no real database writes, no user
PII from Eloquent, and no tenant identifiers are sent to the lab. The genuine
Eloquent table is still query-scoped and Policy-gated.

## Select interaction QA

- Table toolbar: **Group by** trigger is compact, keyboard-focusable, and its dropdown supports a search box.
- Filters: **Role / Verified / Status / Featured** use the same searchable Select. Selecting a draft filter does not apply it until **Apply filters** is clicked.
- Footer + settings: **Per page** and **Pagination** use compact searchable Select controls.
- Create/Edit dialogs: role and status dropdowns use the same controlled Select without submitting the form.
- Existing \`/admin/tables-showcase\` SelectFilters also display searchable dropdowns; Eloquent selection still triggers the original server-side filter query.
- Test keyboard interactions: open with Enter or ArrowDown, type to narrow, navigate ArrowUp/ArrowDown, choose with Enter, close with Escape, click outside to dismiss.
- Check empty-search feedback, selection checkmarks, dark/light appearance, narrow viewport, and Arabic RTL.

## Verification

    cd react
    php artisan test tests/Feature/LavertiaFilamentTablesLabTest.php
    npm run types:check
    npm run build

The new route is registered by Panels page discovery under
/admin/filament-tables-lab, not by an unrelated Inertia route.

**Design reference:** https://filamentphp.com/docs/5.x/tables/overview
**Package comparison:** https://github.com/lavertia/tables
