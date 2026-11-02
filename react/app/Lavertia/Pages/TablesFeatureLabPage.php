<?php

declare(strict_types=1);

namespace App\Lavertia\Pages;

use App\Lavertia\Components\TablesFeatureLab;
use App\Lavertia\Concerns\ResolvesDemoTeam;
use App\Lavertia\Models\DemoPost;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Lavertia\Panels\Components\Action;
use Lavertia\Panels\Components\PageHeader;
use Lavertia\Panels\Pages\Page;
use Lavertia\Support\Contracts\Component;
use Lavertia\Tables\Components\IconColumn;
use Lavertia\Tables\Components\SelectFilter;
use Lavertia\Tables\Components\Table;
use Lavertia\Tables\Components\TextColumn;

final class TablesFeatureLabPage extends Page
{
    use ResolvesDemoTeam;

    public static function slug(): string
    {
        return 'tables-feature-lab';
    }

    public static function title(): string
    {
        return 'Tables Feature Lab';
    }

    /** @return list<Component> */
    protected function components(): array
    {
        $teamId = $this->activeDemoTeamId();
        $feature = filter_var(request()->query('feature', 1), FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1, 'max_range' => 28],
        ]);
        $feature = $feature === false ? 1 : $feature;

        $databaseReady = DemoPost::query()->where('team_id', $teamId)->exists();
        $usesEloquent = $databaseReady && in_array($feature, [
            2, 3, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 19, 20, 23, 24, 25, 26, 27,
        ], true);

        $selectedRecord = null;

        if ($feature === 15 && $databaseReady) {
            $record = request()->query('record');

            if (is_string($record) && ctype_digit($record)) {
                $post = DemoPost::query()
                    ->where('team_id', $teamId)
                    ->with('authorUser:id,name')
                    ->whereKey((int) $record)
                    ->first();

                if ($post !== null) {
                    $selectedRecord = [
                        'title' => $post->title,
                        'slug' => $post->slug,
                        'status' => $post->status,
                        'author' => $post->author,
                    ];
                }
            }
        }

        $table = $this->featureTable($feature, $teamId, $usesEloquent);

        return [
            PageHeader::make('Tables Feature Lab')
                ->eyebrow('Lavertia / Feature Explorer')
                ->description('28 hands-on experiments based on Filament 5 Tables overview. Every example is labeled native, UI preview, partial, or optional.')
                ->actions([
                    Action::make('users-posts')->label('Users & Posts')->appearance('outline')
                        ->url('/admin/filament-tables-lab'),
                    Action::make('commerce')->label('Commerce Tables')->appearance('outline')
                        ->url('/admin/commerce-tables-lab'),
                ]),
            TablesFeatureLab::make($table, $feature, $databaseReady, $selectedRecord),
        ];
    }

    public function featureTable(int $feature, int $teamId, bool $usesEloquent): Table
    {
        $table = $this->applyLabDefaults(Table::make('feature-explorer'))
            ->label('Blog posts')
            ->description('One PHP-defined LavertiaTable. Changes to this scenario are read-only or browser-local.')
            ->columns([
                TextColumn::make('id')->label('ID')->hidden(),
                TextColumn::make('title')->label('Title')->sortable()->searchable(),
                TextColumn::make('slug')->label('Slug')->sortable()->searchable()->toggleable(),
                TextColumn::make('status')->label('Status')->sortable()->badge([
                    'draft' => 'neutral',
                    'reviewing' => 'warning',
                    'published' => 'success',
                ]),
                TextColumn::make('author')->label('Author')->toggleable(),
                IconColumn::make('featured')->label('Featured')->boolean()->toggleable(),
                TextColumn::make('sort_order')->label('Sort order')->sortable()->toggleable(true, true),
            ]);

        // The Lab is an isolated feature explorer, not a table with every
        // capability always enabled. Only the filtering example defines filters.
        if ($feature === 5) {
            $table = $table->filters([
                SelectFilter::make('status')->label('Status')->options([
                    'draft' => 'Draft',
                    'reviewing' => 'Reviewing',
                    'published' => 'Published',
                ]),
                SelectFilter::make('featured')->label('Featured')->options([
                    '1' => 'Yes',
                    '0' => 'No',
                ]),
            ]);
        }

        if ($feature === 4) {
            $table = $table->pushColumns([
                TextColumn::make('created_at')->label('Created at')->toggleable()->sortable(),
            ]);
        }

        if ($feature === 8) {
            $table = $table->paginationPageOptions([10, 25, 50])
                ->defaultPaginationPageOption(25);
        }

        if ($feature === 9) {
            $table = $table->paginationPageOptions([10, 25])
                ->defaultPaginationPageOption(10);
        }

        if ($feature === 10) {
            $table = $table->persistPerPageInSession(false);
        }

        if ($feature === 11) {
            $table = $table->extremePaginationLinks();
        }

        if ($feature === 12) {
            $table = $table->paginationMode('simple');
        }

        if ($feature === 14) {
            $table = $table->paginated(false);
        }

        if ($feature === 19) {
            $table = $table->heading('Article library')
                ->description('This heading and description are configured in PHP.');
        }

        if ($feature === 20) {
            $table = $table->poll(10);
        }

        if ($feature === 24) {
            $table = $table->persistPerPageInSession();
        }

        if ($feature === 25 || $feature === 27) {
            $table = $table->recordTones('status', [
                'draft' => 'neutral',
                'reviewing' => 'warning',
                'published' => 'success',
            ]);
        }

        if ($feature === 26) {
            $table = $table->striped();
        }

        if ($usesEloquent) {
            if ($feature === 15) {
                $table = $table->recordUrl(
                    static fn (Model $record): string => '/admin/tables-feature-lab?feature=15&record='.$record->getKey(),
                );
            }

            return $table->eloquent(
                DemoPost::query()->where('team_id', $teamId)->with('authorUser:id,name'),
                fn (): bool => auth()->user()?->teamMemberships()
                    ->where('team_id', $teamId)->exists() === true,
                10,
            );
        }

        return $table->rows(self::sampleRows());
    }

    private function applyLabDefaults(Table $table): Table
    {
        return $table
            ->searchable()
            ->columnManager()
            ->reorderableColumns()
            ->paginationPageOptions([5, 10, 25, 50])
            ->extremePaginationLinks(false);
    }

    /** @return list<array<string, scalar|null>> */
    private static function sampleRows(): array
    {
        $titles = [
            'What is Lavertia?', 'Designing accessible tables',
            'Writing type-safe filters', 'Team permissions guide',
            'Large dataset pagination', 'Using relations with Eloquent',
            'Understanding table actions', 'Optimizing SQL queries',
            'Building an admin dashboard', 'Localized content workflows',
        ];
        $authors = ['Dan Harrin', 'Ryan Chandler', 'Zep Fietje', 'Nora Haddad', 'Maya Saad'];
        $states = ['published', 'reviewing', 'draft'];

        $rows = [];

        for ($i = 0; $i < 45; $i++) {
            $title = $titles[$i % count($titles)];
            $rows[] = [
                'id' => $i + 1,
                'title' => $title.' #'.($i + 1),
                'slug' => Str::slug($title).'-'.($i + 1),
                'status' => $states[$i % count($states)],
                'author' => $authors[$i % count($authors)],
                'featured' => $i % 4 === 0,
                'sort_order' => $i,
                'created_at' => '2026-10-'.str_pad((string) (($i % 27) + 1), 2, '0', STR_PAD_LEFT),
            ];
        }

        return $rows;
    }
}
