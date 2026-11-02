<?php

declare(strict_types=1);

namespace App\Lavertia\Components;

use Lavertia\Support\Components\AbstractComponent;
use Lavertia\Support\Contracts\Component;
use Lavertia\Tables\Components\Table;

/**
 * Feature explorer metadata and one real, shared PHP-defined Lavertia Table.
 *
 * Statuses distinguish actual package functionality from isolated UI demos.
 * Code snippets describe Lavertia APIs, never silently use Filament classes.
 */
final class TablesFeatureLab extends AbstractComponent
{
    private function __construct(
        private readonly Table $table,
        private readonly int $active,
        private readonly bool $databaseReady,
        private readonly ?array $selectedRecord,
    ) {}

    public static function make(Table $table, int $active, bool $databaseReady, ?array $selectedRecord): self
    {
        return (new self($table, $active, $databaseReady, $selectedRecord))
            ->key('tables-feature-lab');
    }

    public function getType(): string
    {
        return 'tables-feature-lab';
    }

    /** @return list<Component> */
    public function getComponents(): array
    {
        return [$this->table];
    }

    /** @return array<string, mixed> */
    public function getProps(): array
    {
        return [
            'active' => $this->active,
            'catalog' => self::catalog(),
            'databaseReady' => $this->databaseReady,
            'selectedRecord' => $this->selectedRecord,
            'demoOnly' => true,
            'locale' => app()->getLocale(),
        ];
    }

    /** @return list<array{id:int, title:string, group:string, status:string, description:string, exercise:string, snippet:string}> */
    public static function catalog(): array
    {
        return [
            self::item(1, 'Defining table columns', 'Columns', 'native', 'PHP defines text and boolean columns. This experiment also enables only the column visibility/reordering controls.', 'Toggle a column or move it up and down. The manager list and table headers must stay in sync.', "->columns([\n    TextColumn::make('title'),\n    TextColumn::make('slug')->toggleable(),\n    IconColumn::make('featured')->boolean()->toggleable(),\n])\n->columnManager()\n->reorderableColumns()"),
            self::item(2, 'Sortable and searchable columns', 'Columns', 'native', 'Search and sort are handled by the scoped Eloquent query when demo data is seeded.', 'Search a title, then click its column heading.', "TextColumn::make('title')\n    ->sortable()\n    ->searchable()"),
            self::item(3, 'Accessing related data', 'Columns', 'partial', 'Author names are eagerly loaded with Eloquent and exposed through an author accessor. Automatic dot-notation columns are not supported yet.', 'Show the Author column; inspect the joined display value.', "DemoPost::query()\n    ->with('authorUser:id,name');\nTextColumn::make('author');"),
            self::item(4, 'Appending columns', 'Columns', 'native', 'pushColumns() appends instead of replacing the configured PHP columns.', 'Look for the additional Created at column.', "->columns([TextColumn::make('title')])\n->pushColumns([\n    TextColumn::make('created_at')->label('Created'),\n])"),
            self::item(5, 'Defining filters', 'Filters & actions', 'native', 'A server-side allowlisted SelectFilter is available from PHP.', 'Open Filters and select Published or Draft.', "->filters([\n    SelectFilter::make('status')->options([\n        'draft' => 'Draft',\n        'published' => 'Published',\n    ]),\n])"),
            self::item(6, 'Table actions', 'Filters & actions', 'partial', 'Read-only View and CSV export actions work. Mutating actions require dedicated routes and policies.', 'Open a row action menu; view details or export the record.', "->columns([...])\n// View and CSV export live in LavertiaTable.\n// Edit/Delete actions need policy-protected endpoints."),
            self::item(7, 'Pagination', 'Pagination', 'native', 'Uses database LIMIT/OFFSET, not the entire result set.', 'Use Next page and check the displayed range.', "->eloquent(\$authorizedQuery, \$authorize, 10)"),
            self::item(8, 'Default pagination page size', 'Pagination', 'native', 'Uses 25 records as the configured default.', 'Observe the rows-per-page selector showing 25.', "->paginationPageOptions([10, 25, 50])\n->defaultPaginationPageOption(25)"),
            self::item(9, 'Enforcing pagination options', 'Pagination', 'native', 'Only 10 and 25 records per page are allowed, including for forged URL parameters.', 'Open the page-size menu; try a forged perPage=999 query.', "->paginationPageOptions([10, 25])\n->defaultPaginationPageOption(10)"),
            self::item(10, 'No session page-size persistence', 'Pagination', 'native', 'Session persistence is disabled by default.', 'Change per-page, then reload the URL without the perPage query parameter.', "->persistPerPageInSession(false)"),
            self::item(11, 'First and last pagination links', 'Pagination', 'native', 'Displays extreme page navigation controls.', 'Use first/last page arrows on a seeded table.', "->extremePaginationLinks()"),
            self::item(12, 'Simple pagination', 'Pagination', 'native', 'Laravel simplePaginate avoids COUNT(*); no total-page number is claimed.', 'Use Previous/Next with no numbered last page.', "->paginationMode('simple')"),
            self::item(13, 'Identifying tables', 'Pagination', 'native', 'Unique name prefixes isolate pagination, sorting and filters from other tables.', 'Observe lvt_feature-explorer_* in the URL.', "Table::make('feature-explorer')"),
            self::item(14, 'Disabling pagination', 'Pagination', 'native', 'Unpaginated Eloquent mode is capped at 100 records to protect response size.', 'See that pagination controls disappear.', "->paginated(false)\n// Hard safety cap: 100 records"),
            self::item(15, 'Record URLs (clickable rows)', 'Rows & reordering', 'native', 'URLs are resolved from authorized Eloquent models and restricted to same-origin paths.', 'Click a row to open its team-scoped read-only detail.', "->recordUrl(fn (Model \$post) =>\n    '/admin/tables-feature-lab?feature=15&record='.\$post->getKey()\n)"),
            self::item(16, 'Reordering records', 'Rows & reordering', 'demo', 'Preview-only reordering: changes local browser state, never the database.', 'Enable reorder mode and move rows up or down.', "// Preview: change the order locally.\n// Production: add authorized persistent reorder action."),
            self::item(17, 'Custom reordering trigger', 'Rows & reordering', 'demo', 'Custom label and trigger state are demonstrated only in the preview.', 'Toggle the reorder button and watch the label change.', "// UI demo: Enable / Finish reordering\n// No permanent DB update."),
            self::item(18, 'Before/after reorder hooks', 'Rows & reordering', 'demo', 'The event log shows before/after events from local reorder operations.', 'Move a record and inspect the event log.', "// UI preview events: beforeReorder / afterReorder.\n// Production hooks require a transactional endpoint."),
            self::item(19, 'Table header', 'Presentation', 'native', 'PHP sets the table heading and description.', 'Observe the custom table header.', "->heading('Article library')\n->description('Manage your sample articles.')"),
            self::item(20, 'Polling table content', 'Data loading', 'native', 'A 10-second interval reloads the Eloquent table while the tab is visible.', 'Watch the polling label; the timer pauses for hidden tabs.', "->poll(10)\n// Eloquent views only"),
            self::item(21, 'Lazy loading table data', 'Data loading', 'demo', 'The preview demonstrates progressive loading; true server-deferred Inertia props are not implemented.', 'Click Load preview to reveal the table after its skeleton.', "// UI-only loading preview.\n// Real deferred Inertia props: pending API."),
            self::item(22, 'Loading skeleton', 'Data loading', 'demo', 'Skeleton styling is interactive; this is a visual preview, not deferred SQL.', 'Show and hide the table loading skeleton.', "// Visual skeleton preview in React.\n// No deferred query endpoint."),
            self::item(23, 'Searching with Laravel Scout', 'Data loading', 'guide', 'Scout is not installed in the Playground. Existing SQL search still works.', 'Compare SQL search, then review the optional Scout integration pattern.', "// Optional once Scout is installed:\n// \$query->whereKey(Post::search(\$search)->keys());\n// The backend must validate tenant scope."),
            self::item(24, 'Persisting table state in session', 'Data loading', 'partial', 'The PHP Table persists page size per route and table only when opted in. Other state remains URL-driven.', 'Change per-page, clear the perPage URL query and reload in this browser session.', "->persistPerPageInSession()\n// Persists page size only; search/sort remain in URL"),
            self::item(25, 'Styling table rows', 'Presentation', 'native', 'Semantic row-tone props are rendered as safe design-system classes.', 'Compare row colors for Draft, Reviewing and Published.', "->recordTones('status', [\n    'draft' => 'neutral',\n    'reviewing' => 'warning',\n    'published' => 'success',\n])"),
            self::item(26, 'Striped rows', 'Presentation', 'native', 'Striping is configured in PHP and applied by the shared renderer.', 'See alternating row backgrounds.', "->striped()"),
            self::item(27, 'Custom row classes', 'Presentation', 'partial', 'Supports semantic tones, not arbitrary CSS closures; this prevents style injection.', 'Compare semantic row highlights against striped rows.', "->recordTones('status', [\n    'published' => 'success',\n    'reviewing' => 'warning',\n])"),
            self::item(28, 'Global settings', 'Presentation', 'guide', 'Shows a shared table preset pattern. A process-global configureUsing() callback is not implemented.', 'Compare the common table defaults and the scenario-specific overrides.', "private function applyDefaults(Table \$table): Table\n{\n    return \$table->paginationPageOptions([5, 10, 25, 50])\n        ->columnManager()\n        ->searchable();\n}"),
        ];
    }

    /** @return array{id:int, title:string, group:string, status:string, description:string, exercise:string, snippet:string} */
    private static function item(
        int $id,
        string $title,
        string $group,
        string $status,
        string $description,
        string $exercise,
        string $snippet,
    ): array {
        return compact('id', 'title', 'group', 'status', 'description', 'exercise', 'snippet');
    }
}
