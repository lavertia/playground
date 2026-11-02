<?php

declare(strict_types=1);

namespace App\Lavertia\Pages;

use App\Lavertia\Concerns\ResolvesDemoTeam;
use App\Lavertia\Models\DemoPost;
use App\Models\User;
use Lavertia\Panels\Components\Action;
use Lavertia\Panels\Components\PageHeader;
use Lavertia\Panels\Components\Section;
use Lavertia\Panels\Pages\Page;
use Lavertia\Support\Contracts\Component;
use Lavertia\Tables\Components\IconColumn;
use Lavertia\Tables\Components\SelectFilter;
use Lavertia\Tables\Components\Table;
use Lavertia\Tables\Components\TextColumn;

/**
 * Two actual Eloquent tables; React receives a Lavertia Table component tree.
 * No hard-coded user/post arrays or browser-only duplicate table engine.
 */
final class FilamentTablesLabPage extends Page
{
    use ResolvesDemoTeam;

    public static function slug(): string
    {
        return 'filament-tables-lab';
    }

    public static function title(): string
    {
        return 'Users & Posts Tables';
    }

    public function usersTable(Table $table, int $teamId): Table
    {
        return $table
            ->label('Users')
            ->description('Existing Laravel users table, scoped to members of your active team.')
            ->searchable()
            ->columnManager()
            ->reorderableColumns()
            ->groupable(['role' => 'Role'])
            ->columns([
                TextColumn::make('id')->label('ID')->sortable()->toggleable(true, true),
                TextColumn::make('name')->label('Name')->sortable()->searchable(),
                TextColumn::make('email')->label('Email address')->sortable()->searchable(),
                TextColumn::make('role')->label('Team role')
                    ->badge(['owner' => 'success', 'admin' => 'info', 'member' => 'neutral']),
                IconColumn::make('email_verified_at')->label('Verified')->boolean()->toggleable(),
            ])
            ->filters([
                SelectFilter::make('role')->label('Role')
                    ->source('team_members.role')
                    ->options(['owner' => 'Owner', 'admin' => 'Admin', 'member' => 'Member']),
                SelectFilter::make('email_verified_at')->label('Verification')
                    ->options(['yes' => 'Verified', 'no' => 'Not verified'])->presence(),
            ])
            ->eloquent(
                User::query()
                    ->join('team_members', 'users.id', '=', 'team_members.user_id')
                    ->where('team_members.team_id', $teamId)
                    ->select([
                        'users.id',
                        'users.name',
                        'users.email',
                        'users.email_verified_at',
                        'team_members.role as role',
                    ]),
                fn (): bool => auth()->user()?->teamMemberships()->where('team_id', $teamId)->exists() === true,
                10,
            );
    }

    public function postsTable(Table $table, int $teamId): Table
    {
        return $table
            ->label('Blog Posts')
            ->description('Database-backed posts, scoped to your active team.')
            ->searchable()
            ->columnManager()
            ->reorderableColumns()
            ->groupable(['status' => 'Status', 'author' => 'Author'])
            ->tabs('status', [
                'draft' => 'Draft',
                'reviewing' => 'Reviewing',
                'published' => 'Published',
            ])
            ->columns([
                TextColumn::make('id')->label('ID')->sortable()->toggleable(true, true),
                TextColumn::make('title')->label('Title')->sortable()->searchable(),
                TextColumn::make('slug')->label('Slug')->searchable()->toggleable(),
                TextColumn::make('status')->label('Status')->sortable()->badge([
                    'draft' => 'neutral',
                    'reviewing' => 'warning',
                    'published' => 'success',
                ]),
                TextColumn::make('author')->label('Author')->toggleable(),
                IconColumn::make('featured')->label('Featured')->boolean()->sortable()->toggleable(),
                TextColumn::make('sort_order')->label('Order')->sortable()->toggleable(true, true),
            ])
            ->filters([
                SelectFilter::make('status')->label('Status')->options([
                    'draft' => 'Draft',
                    'reviewing' => 'Reviewing',
                    'published' => 'Published',
                ]),
                SelectFilter::make('featured')->label('Featured')->options([
                    '1' => 'Yes',
                    '0' => 'No',
                ]),
            ])
            ->eloquent(
                DemoPost::query()->where('team_id', $teamId)->with('authorUser:id,name'),
                fn (): bool => auth()->user()?->teamMemberships()->where('team_id', $teamId)->exists() === true,
                10,
            );
    }

    /** @return list<Component> */
    protected function components(): array
    {
        $teamId = $this->activeDemoTeamId();

        return [
            PageHeader::make('Filament-inspired Tables')
                ->eyebrow('Lavertia / Native PHP Table API')
                ->description('Real Eloquent Users and Posts, rendered by the shared Lavertia Table React component. Read-only demonstration.')
                ->actions([
                    Action::make('commerce-tables')->label('Products & Orders')->appearance('outline')
                        ->url('/admin/commerce-tables-lab'),
                ]),
            Section::make('01 / Users')
                ->description('Members of the current team, with server-side filters and pagination.')
                ->components([$this->usersTable(Table::make('lab-users'), $teamId)]),
            Section::make('02 / Blog posts')
                ->description('Team posts, status tabs, grouping and column controls.')
                ->components([$this->postsTable(Table::make('lab-posts'), $teamId)]),
        ];
    }
}
