<?php

declare(strict_types=1);

namespace App\Lavertia\Pages;

use App\Lavertia\Models\DemoTicket;
use App\Lavertia\Resources\DemoTicketResource;
use Illuminate\Support\Facades\Gate;
use Lavertia\Panels\Components\Action;
use Lavertia\Panels\Components\PageHeader;
use Lavertia\Panels\Components\Section;
use Lavertia\Panels\Components\Stat;
use Lavertia\Panels\Components\StatsGrid;
use Lavertia\Panels\Pages\Page;
use Lavertia\Support\Contracts\Component;
use Lavertia\Tables\Components\SelectFilter;
use Lavertia\Tables\Components\Table;
use Lavertia\Tables\Components\TextColumn;

/**
 * Table feature catalogue: one zero-setup snapshot and one Policy-protected
 * Eloquent table. All sample directory rows are fictitious.
 */
final class TablesShowcasePage extends Page
{
    public static function slug(): string
    {
        return 'tables-showcase';
    }

    public static function title(): string
    {
        return 'Tables Showcase';
    }

    /** @return list<Component> */
    protected function components(): array
    {
        return [
            PageHeader::make('Tables Showcase')
                ->eyebrow('Lavertia / Component Lab')
                ->description(
                    'Try search, filters, sorting, column visibility, reordering, pagination and status badges. '
                    .'The directory is fictitious; tickets below use your real authorized Eloquent scope.',
                )
                ->actions([
                    Action::make('filament-style-lab')
                        ->label('Try Filament-style table lab')
                        ->appearance('primary')
                        ->url('/lavertia-tables-lab.html'),
                    Action::make('table-docs')
                        ->label('Table documentation')
                        ->appearance('outline')
                        ->url('https://lavertia.github.io/lavertia-doc/packages/tables/'),
                ]),

            StatsGrid::make([
                Stat::make('Preview records', '12')
                    ->description('Fictitious, stored in the Page')
                    ->tone('primary'),
                Stat::make('Data sources', '02')
                    ->description('Snapshot and Eloquent')
                    ->tone('success'),
                Stat::make('Table filters', '02')
                    ->description('Status and department')
                    ->tone('warning'),
                Stat::make('Frontend adapters', '03')
                    ->description('React, Vue and Svelte')
                    ->tone('neutral'),
            ]),

            Section::make('01 / Interactive snapshot')
                ->description('Try changing the view. Search, filters, sorting and paging run in the browser on these 12 demonstration rows.')
                ->components([
                    Table::make('showcase-directory')
                        ->label('Team directory')
                        ->description('Fictitious records · live browser-only interactions · no database writes.')
                        ->searchable()
                        ->columnManager()
                        ->reorderableColumns()
                        ->filters([
                            SelectFilter::make('status')
                                ->label('Status')
                                ->options([
                                    'Active' => 'Active',
                                    'Pending' => 'Pending',
                                    'Invited' => 'Invited',
                                ]),
                            SelectFilter::make('department')
                                ->label('Department')
                                ->options([
                                    'Engineering' => 'Engineering',
                                    'Design' => 'Design',
                                    'Operations' => 'Operations',
                                    'Sales' => 'Sales',
                                ]),
                        ])
                        ->columns([
                            TextColumn::make('id')
                                ->label('ID')
                                ->sortable(),
                            TextColumn::make('name')
                                ->label('Full name')
                                ->sortable()
                                ->searchable(),
                            TextColumn::make('email')
                                ->label('Email')
                                ->searchable()
                                ->toggleable(),
                            TextColumn::make('department')
                                ->label('Department')
                                ->sortable()
                                ->toggleable(),
                            TextColumn::make('status')
                                ->label('Status')
                                ->sortable()
                                ->badge([
                                    'Active' => 'success',
                                    'Pending' => 'warning',
                                    'Invited' => 'info',
                                ]),
                            TextColumn::make('location')
                                ->label('Location')
                                ->toggleable(true, true),
                        ])
                        ->rows(self::sampleDirectory()),
                ]),

            Section::make('02 / Eloquent: real server pagination')
                ->description(
                    'This table reads only tickets owned by the current user in the active team. '
                    .'It may be empty until you create demo tickets. Search, filters, sorting and pagination run in Laravel.',
                )
                ->components([
                    Table::make('showcase-tickets')
                        ->label('My demo tickets')
                        ->description('Database-backed · tenant-scoped · viewAny Policy · 5 records per page.')
                        ->searchable()
                        ->columnManager()
                        ->filters([
                            SelectFilter::make('status')
                                ->label('Ticket status')
                                ->options([
                                    'draft' => 'Draft',
                                    'published' => 'Published',
                                ]),
                        ])
                        ->columns([
                            TextColumn::make('id')
                                ->label('ID')
                                ->sortable(),
                            TextColumn::make('title')
                                ->label('Title')
                                ->sortable()
                                ->searchable(),
                            TextColumn::make('status')
                                ->label('Status')
                                ->sortable()
                                ->badge([
                                    'draft' => 'warning',
                                    'published' => 'success',
                                ]),
                        ])
                        ->eloquent(
                            DemoTicketResource::query()->select(['id', 'title', 'status']),
                            static fn (): bool => Gate::allows('viewAny', DemoTicket::class),
                            perPage: 5,
                        ),
                ]),
        ];
    }

    /**
     * Small, non-sensitive snapshot: never use this mode for unrestricted
     * personally identifiable or tenant-specific production datasets.
     *
     * @return list<array<string, int|string>>
     */
    private static function sampleDirectory(): array
    {
        return [
            ['id' => 101, 'name' => 'Nora Haddad', 'email' => 'nora@example.com', 'department' => 'Engineering', 'status' => 'Active', 'location' => 'Beirut'],
            ['id' => 102, 'name' => 'Adam Farah', 'email' => 'adam@example.com', 'department' => 'Design', 'status' => 'Active', 'location' => 'Tripoli'],
            ['id' => 103, 'name' => 'Maya Saad', 'email' => 'maya@example.com', 'department' => 'Operations', 'status' => 'Pending', 'location' => 'Baalbek'],
            ['id' => 104, 'name' => 'Karim Issa', 'email' => 'karim@example.com', 'department' => 'Engineering', 'status' => 'Active', 'location' => 'Zahle'],
            ['id' => 105, 'name' => 'Lina Mansour', 'email' => 'lina@example.com', 'department' => 'Sales', 'status' => 'Invited', 'location' => 'Sidon'],
            ['id' => 106, 'name' => 'Rami Khoury', 'email' => 'rami@example.com', 'department' => 'Operations', 'status' => 'Active', 'location' => 'Beirut'],
            ['id' => 107, 'name' => 'Sara Nassar', 'email' => 'sara@example.com', 'department' => 'Design', 'status' => 'Pending', 'location' => 'Jounieh'],
            ['id' => 108, 'name' => 'Tarek Habib', 'email' => 'tarek@example.com', 'department' => 'Engineering', 'status' => 'Active', 'location' => 'Byblos'],
            ['id' => 109, 'name' => 'Hala Daher', 'email' => 'hala@example.com', 'department' => 'Sales', 'status' => 'Active', 'location' => 'Beirut'],
            ['id' => 110, 'name' => 'Youssef Nasr', 'email' => 'youssef@example.com', 'department' => 'Engineering', 'status' => 'Invited', 'location' => 'Tyre'],
            ['id' => 111, 'name' => 'Dima Saleh', 'email' => 'dima@example.com', 'department' => 'Operations', 'status' => 'Active', 'location' => 'Baalbek'],
            ['id' => 112, 'name' => 'Omar Jaber', 'email' => 'omar@example.com', 'department' => 'Design', 'status' => 'Pending', 'location' => 'Zahle'],
        ];
    }
}
