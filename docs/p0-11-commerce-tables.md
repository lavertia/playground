# P0-11 — Commerce Tables & Advanced Query Builder Lab

## Purpose

Reproduce important **Filament 5 Tables Demo** interactions inside the **Lavertia React Playground**. The implementation is a **browser-only laboratory**: no Products or Orders database tables are created and no mutations are sent to Laravel.

- URL: `/admin/commerce-tables-lab`
- Branch: `feat/p0-11-commerce-tables-query-builder`
- Stacked on: `feat/p0-10-filament-tables-lab`
- UI screenshots/video reference: Filament Demo supplied by the user (2026-11-02).

## Explore

| Experience | What works | Persistence |
| --- | --- | --- |
| Products | 55 fictional products, stock, average price, thumbnail placeholders, SKU/brand/visibility, sort | Browser state |
| Orders | 1,011 fictional orders, status tabs with real sample counts, group by status/date, ascending/descending | Browser state |
| Stats | Recompute totals/inventory/average from the currently matching sample rows | Browser state |
| Query Builder | Match ALL (AND) or ANY (OR), nested groups (3 levels), up to 24 rules | Browser state |
| Field chooser | Searchable shadcn Base Combobox, type-aware operators | Browser state |
| Operators | Contains, Not contains, Equals, Range, Before/After, Is true/false, Is empty | Browser state |
| Rules | Add, duplicate, remove, validation, Apply & Reset | Browser state |
| Table controls | Search, sort, column picker, pagination, page size, bulk selection, row actions | Browser state |
| Summaries | Orders page subtotal and all matching orders subtotal for total/shipping | Browser state |
| CRUD demo | New, View, Duplicate, Delete with dialog confirmation | Browser state |
| Theming | Existing Playground light/dark and panel RTL/LTR direction | Client layout |

The product image column intentionally uses distinct **local thumbnail placeholders** instead of fetching unreliable external photos. The values are deterministic fictional fixtures.

## Code architecture

- `react/app/Lavertia/Pages/CommerceTablesLabPage.php` — protected Panel Page
- `react/app/Lavertia/Components/CommerceTablesLab.php` — deterministic non-production fixture arrays
- `react/resources/js/components/lavertia/commerce-tables-lab.tsx` — Products/Orders UI
- `react/resources/js/components/lavertia/query-builder-editor.tsx` — reusable query UI
- `react/resources/js/components/lavertia/filter-query.ts` — typed expression evaluator
- `react/resources/js/components/lavertia/renderer.tsx` — Lavertia component adapter
- `react/tests/Feature/LavertiaCommerceTablesLabTest.php` — authenticated response tests
- `react/tests/js/filter-query.test.mjs` — nested expression / boundary tests

## Query model

```ts
type FilterNode = FilterRule | FilterGroup

type FilterGroup = {
    type: 'group';
    id: string;
    junction: 'and' | 'or';
    children: FilterNode[];
};
```

Example: `(Name contains "Candle" AND Price > 100) OR (Featured = true AND Quantity < 20)`

1. Add two **AND groups** inside a root group.
2. Set the root operator to **Any (OR)**.
3. In the first subgroup add Name and Price rules.
4. In the second subgroup add Featured and Quantity rules.
5. Press **Apply filters**; press **Reset** to clear them.

Filters apply to **sample rows only**. All fields and operators are selected from typed lists, and invalid expressions are rejected.

## Critical production boundary

**Do not** serialize arbitrary JavaScript query expressions as Eloquent/SQL identifiers or rely on frontend field restrictions for authorization. A production-ready `lavertia/tables` Query Builder requires:

1. A PHP field + operator allowlist and per-field type validator.
2. Query AST deserialization with maximum size/depth/rules limits.
3. Eloquent group-wrapped `where(function (Builder $query) {...})`, with all client values **bound parameters**.
4. Tenant and ownership policies applied to the base query **before** optional filters.
5. Server pagination, policy-aware row resolution, aggregates, and total/count queries.
6. Query-level tests covering nested AND/OR precedence, malicious field identifiers, SQL injections, time zones, count accuracy, and cross-tenant restrictions.
7. Per-user persistable view state only after explicit authorization and scoping.

No production server-side Query Builder API has been implemented in P0-11.

## Verification

```bash
cd react
php artisan test tests/Feature/LavertiaCommerceTablesLabTest.php --compact
node --experimental-strip-types --test tests/js/filter-query.test.mjs
npm run types:check
npm run build
```

Browser QA: verify narrow screens, popover placement, keyboard search, modal focus, dark/light, Arabic RTL, grouping, filter reset, and exact summary consistency. E2E browser testing is still required before release.
