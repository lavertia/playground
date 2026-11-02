# P0-14 — Tables Feature Lab

Hands-on explorer for the 28 Filament 5 Tables overview concepts, translated into native Lavertia PHP Table configurations.

Route: /admin/tables-feature-lab (requires login and current-team authorization). The React explorer provides categorized navigation, exercise instructions, a code sample, and an interactive native LavertiaTable. No database mutations occur.

## Coverage

| Features | Status | Implementation / limitation |
| --- | --- | --- |
| 1-2 | Native | PHP columns with searchable/sortable Eloquent attributes |
| 3 | Partial | Author relation eager loaded with Eloquent; generic relationship dot syntax pending |
| 4-5 | Native | pushColumns and allowlisted SelectFilter |
| 6 | Partial | Read-only record details and CSV; no persistent edit/delete |
| 7-14 | Native | Bounded per-page options, defaults, session opt-in, first/last, simplePaginate and 100-row cap for no-pagination |
| 15 | Native | Server-scoped same-origin clickable record URLs |
| 16-18 | UI preview | Client-only up/down reordering, custom trigger, before/after event log |
| 19-20 | Native | Header/description, visible-tab Eloquent polling |
| 21-22 | UI preview | Loading skeleton and staged display, no deferred database request |
| 23 | Guide | Scout integration example; Scout is not installed |
| 24 | Partial | Session persistence for page size only |
| 25-26 | Native | Semantic row tones and stripes |
| 27 | Partial | Safe semantic tones rather than arbitrary class closures |
| 28 | Guide | Shared PHP presets; no framework-wide configureUsing hook |

## Sources

- PHP Page: react/app/Lavertia/Pages/TablesFeatureLabPage.php
- Catalog: react/app/Lavertia/Components/TablesFeatureLab.php
- Explorer: react/resources/js/components/lavertia/tables-feature-lab.tsx
- Shared Table: react/resources/js/components/lavertia/lavertia-table.tsx
- PHP Table API: lavertia/tables src/Components/Table.php on feat/p0-14-table-features

## Local setup

From the playground/react directory:

    git status --short
    git fetch origin
    git switch feat/p0-14-table-feature-lab
    git pull --ff-only
    cd ../../tables
    git fetch origin
    git switch feat/p0-14-table-features
    git pull --ff-only
    cd ../playground/react
    composer update lavertia/tables lavertia/forms lavertia/panels --with-all-dependencies
    php artisan migrate
    php artisan optimize:clear
    npm ci
    npm run types:check
    npm run build
    npm run dev

Optional local-only Eloquent data: configure LAVERTIA_DEMO_OWNER_EMAIL for an existing local account, then run php artisan db:seed --class=DemoTablesSeeder. The seeder refuses non-local/testing environments. Empty demo tables fall back to 45 bounded snapshot rows.

## Checks and boundaries

Run php artisan test tests/Feature/LavertiaTablesFeatureLabTest.php, npm run types:check and npm run build. CI also verifies PHP package tests/Pint and browser interactions in Chromium. Auth and membership scopes are enforced before reading records. A disabled paginator cannot send more than 100 Eloquent records. Do not treat this lab as complete Filament compatibility: persistent reorder hooks, real Scout, deferred server-loading, full CRUD, arbitrary class callbacks and global configureUsing are not implemented.
