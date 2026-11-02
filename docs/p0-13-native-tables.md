# P0-13 — Native Lavertia Tables, Eloquent-backed demo data

## Goal

Replace and delete the two separately coded browser-only table engines
(`filament-tables-lab.tsx` and `commerce-tables-lab.tsx`) with one common,
server-owned, declarative `Lavertia\Tables\Components\Table` protocol.
The four new PHP definitions use the same React `LavertiaTable` renderer:

| Page | Table | Real Eloquent source | Tenant protection |
| --- | --- | --- | --- |
| `/admin/filament-tables-lab` | Users | Existing `users` joined to `team_members` | Active-team membership |
| same | Posts | `lavertia_demo_posts`, author via relationship | `team_id` plus membership |
| `/admin/commerce-tables-lab` | Products | `lavertia_demo_products` | `team_id` plus membership |
| same | Orders | `lavertia_demo_orders` | `team_id` plus membership |

**There is no new authentication users table.** Only the existing Laravel
`users` and `team_members` are used. The demo Posts, Products, and Orders
tables are namespaced to avoid collisions with real application models.

### PHP declaration example

```php
public function ordersTable(Table $table, int $teamId): Table
{
    return $table
        ->searchable()
        ->columnManager()
        ->groupable(['status' => 'Status'])
        ->tabs('status', ['new' => 'New', 'delivered' => 'Delivered'])
        ->columns([
            TextColumn::make('number')->searchable()->sortable(),
            TextColumn::make('customer')->searchable(),
            TextColumn::make('status')->badge(['delivered' => 'success']),
            TextColumn::make('total_price')->money('USD')->sortable(),
        ])
        ->summarize(['total_price'])
        ->eloquent(
            DemoOrder::query()->where('team_id', $teamId),
            fn (): bool => auth()->user()?->teamMemberships()
                ->where('team_id', $teamId)->exists() === true,
            10,
        );
}
```

Source: `react/app/Lavertia/Pages/FilamentTablesLabPage.php` and
`react/app/Lavertia/Pages/CommerceTablesLabPage.php`.

### Seeding and local run

**Seed only in local/testing.** The seeder explicitly blocks production,
does not run during `migrate`, and uses upsert for deterministic repeat runs.
By default it targets `test@example.com` and creates the user if absent
with a random password. Set `LAVERTIA_DEMO_OWNER_EMAIL` to the email of
your **existing local** login account to seed the active team you use:

```bash
cd ../../tables
git fetch origin
git switch feat/p0-13-table-workspaces
git pull --ff-only
cd ../playground/react
git fetch origin
git switch feat/p0-13-unified-lavertia-tables
git pull --ff-only
composer update lavertia/tables lavertia/panels lavertia/forms --with-all-dependencies
php artisan migrate
LAVERTIA_DEMO_OWNER_EMAIL=you@example.test php artisan db:seed --class=DemoTablesSeeder
php artisan optimize:clear
npm ci
npm run types:check
npm run build
npm run dev
```

Replace `you@example.test` with your existing local login email. Do not
run this on production or accidentally create known-password real users.

Seeder: 50 new fictional team members, 50 demo posts, 55 demo products and
1,011 demo orders. Only the page rows are delivered to Inertia, default 10
per table. All metric/summary counts are computed on server-side scoped queries.

### Common UI capabilities

- Filament-inspired header, toolbar, group selector, fixed-choice Base UI
  Select, searchable shadcn Combobox, column dropdown, status badges and icon
  cells, safe thumb placeholders, row selection and CSV export (current page).
- Server-driven search (explicit submit), allowlisted sort, SelectFilters,
  verified/unverified presence, status tabs, accurate server totals and page
  sizes 5/10/25/50/100.
- Grouping is **within the currently displayed page**, not global SQL groups.
- Column visibility and column order are browser presentation state only.
- Arabic RTL and dark/light mode follow the existing panel appearance.

### Explicitly not included

- Persistent create/edit/delete or bulk delete endpoints (tables are read-only).
- Advanced nested AND/OR SQL query builder: the previous browser-only
  `QueryBuilderEditor` is **not** silently passed through to SQL.
  A server-allowlisted AST compiler needs separate security reviews.
- Persistent drag-to-reorder records, saved views, relationship sorting,
  image upload, or production user-role management.
- Vue/Svelte adapters for new image/currency/boolean presentation features.

### Verification

Run:

```bash
php artisan test tests/Feature/LavertiaFilamentTablesLabTest.php \
  tests/Feature/LavertiaCommerceTablesLabTest.php \
  tests/Feature/LavertiaNativeTablesLabTest.php
npm run types:check
npm run build
```

CI intentionally no longer runs `lavertia:install --force` on the tested
Playground directory. That command overwrites the committed adapter with
generic Panels stubs and would conceal UI regressions. Package stub testing
should be performed in a dedicated, isolated scaffold.

Related PRs:
- Playground PR #30
- lavertia/tables PR #6 (stacked on P0-12 IconColumn)

Keep both Draft until PHP and browser checks are green and manual reference
comparison confirms visual parity.
