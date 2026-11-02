# Table Showcase — Step 1

A single, real Lavertia Page showing the **existing** Tables component protocol, without adding a new table engine.

- PHP source: `react/app/Lavertia/Pages/TablesShowcasePage.php`
- Route: `/admin/tables-showcase` (sign in first)
- Test: `react/tests/Feature/LavertiaTablesShowcaseTest.php`
- Depends on the stacked `lavertia/panels` P0-08 branch; this is an experimental feature PR.

## Try it

Run Laravel and Vite in `react/` using your normal Playground setup, sign in and open `/admin/tables-showcase`. The Page is discovered by the Panel and appears in the Management sidebar.

In the first table, use the search box, Status and Department dropdowns, click sortable column headings, use Columns to hide/show or move columns, and use Next/Previous to page through the 12 fictitious records.

In the second table, the data come from `DemoTicketResource::query()`: rows are restricted to the signed-in user and active team. Search, sort, filter and paginate using Laravel. The table may be empty until your user has tickets.

## API and feature status

| Table option | PHP API | Data source |
| --- | --- | --- |
| Table labels/description | `Table::label()/description()` | Both |
| Search | `Table::searchable()` + TextColumn::searchable() | Snapshot: browser; Eloquent: Laravel |
| Sort | `TextColumn::sortable()` | Snapshot: browser; Eloquent: Laravel |
| Status/department filters | `SelectFilter::make()->options()` | Both |
| Badges | `TextColumn::badge(['value' => 'success'])` | Both |
| Column visibility | `TextColumn::toggleable()` | Browser UI |
| Hidden by default | `TextColumn::toggleable(true, true)` | Browser UI |
| Column manager | `Table::columnManager()` | Browser UI |
| Column reordering | `Table::reorderableColumns()` | Browser UI |
| Pagination | Built-in | Snapshot: 5 rows; Eloquent: configurable, 1–100 |
| Snapshot data | `Table::rows()` | Max 100 scalar rows |
| SQL query | `Table::eloquent($scopedQuery, $authorize, perPage: 5)` | Scope + Gate + validated query params |

**Not yet available:** bulk select/actions, inline editing, export/import, per-row actions, custom SQL filters, JSON field rendering, cursor pagination, persisted column order/visibility and virtualized large tables.

**Security:** column hiding is a *visual preference*, not column-level access control. Do not send sensitive attributes in rows. For Eloquent, query only permitted fields, scope by tenant, and check a Policy. The example never mutates the database.

## Run tests

```bash
cd react
php artisan test tests/Feature/LavertiaTablesShowcaseTest.php
npm run types:check
npm run build
```

See also: [Tables documentation](https://lavertia.github.io/lavertia-doc/packages/tables/).

## Interactive Filament-style visual lab (P0-10)

Launch **Try Filament-style table lab** from the Tables Showcase page, or open `/lavertia-tables-lab.html` on the Playground. The source is at `react/public/lavertia-tables-lab.html`, and does not require a build step or back-end endpoint.

The visual lab reproduces the screenshot scenarios with 51 fictitious users and 50 fictitious blog posts:

- Search, sortable headers, grouping by field and collapsible groups.
- Filter popover with Reset / Apply, status and featured/verified filters.
- Column show/hide and move controls, dark/light, RTL layout, compact/striped/colored rows.
- Pagination (numbered, simple and cursor-*style preview*), selectable per-page size.
- Checkbox selection, select-all matching, bulk feature/delete and destructive confirmation.
- Create/edit/delete with in-browser demo state, drag-and-drop record order and a keyboard fallback.
- Loading skeleton and empty-state visual examples.

**Important:** This visual lab is an isolated prototype. It does not implement the corresponding `lavertia/tables` Eloquent write APIs, server-side bulk operations, real cursor pagination, server persistence, Form Request validation or cross-adapter support. The existing main Page continues to display a real, authorized Eloquent *read-only* table. Do not treat these local interactions as production-grade server features.

Visual QA: verified HTML/JS syntax and tested the essential interactions using Playwright and Chromium in an isolated browser; repository-wide GitHub CI/browser test suites are separate.
