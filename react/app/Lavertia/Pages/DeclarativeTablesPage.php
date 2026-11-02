<?php

declare(strict_types=1);

namespace App\Lavertia\Pages;

use Lavertia\Panels\Components\Action;
use Lavertia\Panels\Components\PageHeader;
use Lavertia\Panels\Components\Section;
use Lavertia\Panels\Pages\Page;
use Lavertia\Support\Contracts\Component;
use Lavertia\Tables\Components\IconColumn;
use Lavertia\Tables\Components\Table;
use Lavertia\Tables\Components\TextColumn;

/**
 * Table definition lives in PHP. React renders the serialized, typed columns.
 *
 * This page uses a small fictional snapshot; see TablesShowcasePage for a
 * server-paginated, authorized Eloquent example.
 */
final class DeclarativeTablesPage extends Page
{
    public static function slug(): string
    {
        return 'declarative-tables';
    }

    public static function title(): string
    {
        return 'Declarative Tables';
    }

    public function table(Table $table): Table
    {
        return $table
            ->label('Blog posts')
            ->description('Columns are configured in PHP; the rows are fictional snapshot data.')
            ->searchable()
            ->columnManager()
            ->reorderableColumns()
            ->columns([
                TextColumn::make('title')
                    ->label('Title')
                    ->sortable()
                    ->searchable(),
                TextColumn::make('slug')
                    ->label('Slug')
                    ->sortable()
                    ->toggleable(),
                IconColumn::make('is_featured')
                    ->label('Is featured')
                    ->boolean()
                    ->sortable()
                    ->toggleable(),
            ]);
    }

    /** @return list<Component> */
    protected function components(): array
    {
        return [
            PageHeader::make('Declarative Tables')
                ->eyebrow('Lavertia / Tables PHP API')
                ->description(
                    'Define columns in a PHP table(Table $table): Table method. '
                    .'The React renderer receives a typed component tree, not hard-coded columns.',
                )
                ->actions([
                    Action::make('real-tables')
                        ->label('Eloquent example')
                        ->appearance('outline')
                        ->url('/admin/tables-showcase'),
                    Action::make('commerce-lab')
                        ->label('Advanced UI Lab')
                        ->appearance('outline')
                        ->url('/admin/commerce-tables-lab'),
                ]),
            Section::make('Blog posts / PHP defined')
                ->description('Search, sort, toggle and reorder columns. Green checks represent true; red crosses represent false.')
                ->components([
                    $this->table(Table::make('blog-posts'))
                        ->rows(self::samplePosts()),
                ]),
        ];
    }

    /** @return list<array{title: string, slug: string, is_featured: bool}> */
    private static function samplePosts(): array
    {
        return [
            ['title' => 'What is Lavertia?', 'slug' => 'what-is-lavertia', 'is_featured' => true],
            ['title' => 'Building Tables with PHP', 'slug' => 'php-defined-tables', 'is_featured' => false],
            ['title' => 'Query Filters and Search', 'slug' => 'query-filters-search', 'is_featured' => true],
            ['title' => 'Designing Accessible Admin Interfaces', 'slug' => 'accessible-admin-interfaces', 'is_featured' => false],
            ['title' => 'Organizing Your Table Columns', 'slug' => 'organizing-table-columns', 'is_featured' => true],
        ];
    }
}
