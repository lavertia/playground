<?php

declare(strict_types=1);

namespace App\Lavertia\Pages;

use Lavertia\Panels\Components\Action;
use Lavertia\Panels\Components\Infolist;
use Lavertia\Panels\Components\PageHeader;
use Lavertia\Panels\Components\Section;
use Lavertia\Panels\Components\Stat;
use Lavertia\Panels\Components\StatsGrid;
use Lavertia\Panels\Components\Table;
use Lavertia\Panels\Components\TextColumn;
use Lavertia\Panels\Components\TextEntry;
use Lavertia\Panels\Components\TextInput;
use Lavertia\Panels\Pages\Page;
use Lavertia\Support\Components\Card;
use Lavertia\Support\Contracts\Component;

final class DashboardPage extends Page
{
    public static function slug(): string
    {
        return 'dashboard';
    }

    public static function title(): string
    {
        return 'Overview';
    }

    /**
     * @return list<Component>
     */
    protected function components(): array
    {
        return [
            PageHeader::make('Overview')
                ->eyebrow('Lavertia / Playground')
                ->description('A composable administration UI powered by Laravel and Inertia. The data below is illustrative only.')
                ->components([
                    Action::make('starter-home')
                        ->label('Starter home')
                        ->appearance('outline')
                        ->url('/'),

                    Action::make('source')
                        ->label('View source')
                        ->appearance('primary')
                        ->url('https://github.com/lavertia/playground'),
                ]),

            StatsGrid::make([
                Stat::make('Team members', '06')
                    ->description('Example directory records')
                    ->tone('primary'),

                Stat::make('Active', '04')
                    ->description('Sample active members')
                    ->tone('success'),

                Stat::make('Invitations', '02')
                    ->description('Pending and invited')
                    ->tone('warning'),

                Stat::make('Frontend stacks', '03')
                    ->description('React, Vue and Svelte')
                    ->tone('neutral'),
            ]),

            Section::make('Team directory')
                ->description('Search and sort the same sample records without making a server request.')
                ->components([
                    Table::make('members')
                        ->label('Members')
                        ->description('An independent table component. Local preview data only.')
                        ->searchable()
                        ->columns([
                            TextColumn::make('name')
                                ->label('Full name')
                                ->sortable(),

                            TextColumn::make('email')
                                ->label('Email address')
                                ->sortable(),

                            TextColumn::make('role')
                                ->label('Role')
                                ->sortable(),

                            TextColumn::make('status')
                                ->label('Status')
                                ->badge([
                                    'Active' => 'success',
                                    'Pending' => 'warning',
                                    'Invited' => 'info',
                                ]),
                        ])
                        ->rows([
                            ['id' => 1, 'name' => 'Mostafa', 'email' => 'mostafa@example.com', 'role' => 'Owner', 'status' => 'Active'],
                            ['id' => 2, 'name' => 'Sara', 'email' => 'sara@example.com', 'role' => 'Admin', 'status' => 'Active'],
                            ['id' => 3, 'name' => 'Ahmad', 'email' => 'ahmad@example.com', 'role' => 'Manager', 'status' => 'Active'],
                            ['id' => 4, 'name' => 'Maya', 'email' => 'maya@example.com', 'role' => 'Editor', 'status' => 'Active'],
                            ['id' => 5, 'name' => 'Omar', 'email' => 'omar@example.com', 'role' => 'Member', 'status' => 'Pending'],
                            ['id' => 6, 'name' => 'Lina', 'email' => 'lina@example.com', 'role' => 'Member', 'status' => 'Invited'],
                        ]),
                ]),

            Section::make('Workspace details')
                ->description('Read-only infolist and local form field demonstrate independent component composition.')
                ->components([
                    Card::make([
                        Infolist::make('workspace')
                            ->components([
                                TextEntry::make('name')
                                    ->label('Workspace')
                                    ->value('Lavertia Playground'),

                                TextEntry::make('backend')
                                    ->label('Backend')
                                    ->value('Laravel + Inertia.js'),

                                TextEntry::make('ui')
                                    ->label('UI architecture')
                                    ->value('PHP-first components'),

                                TextEntry::make('persistence')
                                    ->label('Data persistence')
                                    ->value('Not enabled in this demo'),
                            ]),

                        TextInput::make('notes')
                            ->label('Notes (local demo)')
                            ->placeholder('Try typing — no network request is sent')
                            ->helperText('Your input stays in the browser and is not saved.'),
                    ]),
                ]),
        ];
    }
}
