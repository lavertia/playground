# P0-12: Declarative PHP Tables & Select/Combobox polish

This builds on P0-11's browser-only Commerce and Blog/Users UI labs.

## What changed

- The original `Lavertia\Tables\Components\Table` package is the PHP owner of the table schema. It defines columns and filters; it is **not** the screenshot-driven `CommerceTablesLab` React fixture component.
- Open `/admin/declarative-tables` for a table configured by `public function table(Table $table): Table` on `DeclarativeTablesPage`.
- `IconColumn::make('is_featured')->boolean()` comes from `lavertia/tables` PR #5, not Filament internals.
- `Table::make('blog-posts')` constructs a Lavertia Table; the Page explicitly calls `$this->table(...)`. Unlike Filament, Lavertia does not currently discover or inject this method automatically.
- The existing `/admin/tables-showcase` displays **policy and tenant scoped Eloquent** results, where pagination, sort and search are run on Laravel.
- The existing `/admin/commerce-tables-lab` is a **client-only** experimental UI. Its Advanced Query Builder is not a production SQL feature.

## Code example

```php
use Lavertia\Tables\Components\{Table, TextColumn, IconColumn};

public function table(Table $table): Table
{
    return $table
        ->searchable()
        ->columns([
            TextColumn::make('title')->sortable()->searchable(),
            TextColumn::make('slug')->toggleable(),
            IconColumn::make('is_featured')->boolean()->sortable(),
        ]);
}

// When building page components:
$this->table(Table::make('blog-posts'))->rows($safeFictionalRows);
```

In production pass a **scoped Eloquent Builder** plus an explicit authorization callback to `eloquent()`, instead of exposing sensitive snapshot rows.

## UI controls

The UI composes the installed shadcn/Base UI primitives instead of creating homemade dropdowns:

- `TableSelect` uses the original `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` API for short menus (group by, sort direction, comparison, per-page controls).
- `SearchableSelect` and `ConstraintPicker` use Base UI `Combobox` for searchable lists (role, filter field, etc.).
- `Combobox.Empty` stays mounted for screen reader announcements, but `:empty` CSS removes its reserved padding when a result list exists; the element is **not** hidden with `display: none`.
- Option artwork is horizontal and vertically aligned; filters retain keyboard, dialog, and RTL support.

## QA / commands

```bash
cd react
php artisan test tests/Feature/LavertiaDeclarativeTablesTest.php
npm ci
npm run types:check
npm run build
```

CI also runs a Playwright Chromium smoke harness that asserts there are no blank vertical gaps between searchable inputs and options, and checks both native Select and searchable Combobox selection. This is separate from manual visual testing against the user's references.

## PRs

- `lavertia/tables` PR #5 — IconColumn PHP component.
- `lavertia/playground` PR #29 — PHP Page, React adapter, UI refinements and tests.

No new production persistence or untrusted raw SQL evaluation was added.
