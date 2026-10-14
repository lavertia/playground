<?php

declare(strict_types=1);

namespace App\Lavertia\Pages;

use Lavertia\Panels\Components\Action;
use Lavertia\Panels\Components\Checkbox;
use Lavertia\Panels\Components\Form;
use Lavertia\Panels\Components\Infolist;
use Lavertia\Panels\Components\PageHeader;
use Lavertia\Panels\Components\Section;
use Lavertia\Panels\Components\Select;
use Lavertia\Panels\Components\SelectFilter;
use Lavertia\Panels\Components\Stat;
use Lavertia\Panels\Components\StatsGrid;
use Lavertia\Panels\Components\Table;
use Lavertia\Panels\Components\Textarea;
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

    /** @return list<Component> */
    protected function components(): array
    {
        return [
            PageHeader::make(__('lavertia.title'))
                ->eyebrow('Lavertia / Playground')
                ->description(__('lavertia.description'))
                ->components([
                    Action::make('en')->label('English')->appearance('outline')->url('/admin/dashboard?lang=en'),
                    Action::make('ar')->label('العربية')->appearance('outline')->url('/admin/dashboard?lang=ar'),
                    Action::make('fr')->label('Français')->appearance('outline')->url('/admin/dashboard?lang=fr'),
                ]),

            StatsGrid::make([
                Stat::make(__('lavertia.members'), '06')->description(__('lavertia.sample'))->tone('primary'),
                Stat::make(__('lavertia.active'), '04')->description(__('lavertia.sample'))->tone('success'),
                Stat::make(__('lavertia.invitations'), '02')->description(__('lavertia.sample'))->tone('warning'),
                Stat::make(__('lavertia.stacks'), '03')->description('React, Vue, Svelte')->tone('neutral'),
            ]),

            Section::make(__('lavertia.directory'))
                ->description(__('lavertia.search_hint'))
                ->components([
                    Table::make('members')
                        ->label(__('lavertia.members'))
                        ->description(__('lavertia.sample'))
                        ->searchable()
                        ->reorderableColumns()
                        ->columnManager()
                        ->filters([
                            SelectFilter::make('status')
                                ->label(__('lavertia.status'))
                                ->options([
                                    'Active' => __('lavertia.active'),
                                    'Pending' => __('lavertia.pending'),
                                    'Invited' => __('lavertia.invited'),
                                ]),
                            SelectFilter::make('role')
                                ->label(__('lavertia.role'))
                                ->options([
                                    'Owner' => 'Owner',
                                    'Admin' => 'Admin',
                                    'Manager' => 'Manager',
                                    'Editor' => 'Editor',
                                    'Member' => 'Member',
                                ]),
                        ])
                        ->columns([
                            TextColumn::make('name')->label(__('lavertia.name'))->sortable()->searchable(),
                            TextColumn::make('email')->label('Email')->sortable()->searchable()->toggleable(true, true),
                            TextColumn::make('role')->label(__('lavertia.role'))->sortable()->toggleable(),
                            TextColumn::make('status')
                                ->label(__('lavertia.status'))
                                ->badge([
                                    'Active' => 'success',
                                    'Pending' => 'warning',
                                    'Invited' => 'info',
                                ]),
                        ])
                        ->rows([
                            ['name' => 'Mostafa', 'email' => 'mostafa@example.com', 'role' => 'Owner', 'status' => 'Active'],
                            ['name' => 'Sara', 'email' => 'sara@example.com', 'role' => 'Admin', 'status' => 'Active'],
                            ['name' => 'Ahmad', 'email' => 'ahmad@example.com', 'role' => 'Manager', 'status' => 'Active'],
                            ['name' => 'Maya', 'email' => 'maya@example.com', 'role' => 'Editor', 'status' => 'Active'],
                            ['name' => 'Omar', 'email' => 'omar@example.com', 'role' => 'Member', 'status' => 'Pending'],
                            ['name' => 'Lina', 'email' => 'lina@example.com', 'role' => 'Member', 'status' => 'Invited'],
                        ]),
                ]),

            Section::make(__('lavertia.form_demo'))
                ->description(__('lavertia.form_hint'))
                ->components([
                    Form::make('profile-preview')
                        ->label(__('lavertia.form_demo'))
                        ->components([
                            TextInput::make('display_name')->label(__('lavertia.name'))->placeholder('Demo name'),
                            Select::make('role')->label(__('lavertia.role'))->options(['owner' => 'Owner', 'editor' => 'Editor']),
                            Textarea::make('bio')->label(__('lavertia.notes'))->rows(3),
                            Checkbox::make('notify')->label(__('lavertia.notify'))->checked(),
                        ]),
                ]),

            Section::make(__('lavertia.workspace'))
                ->components([
                    Card::make([
                        Infolist::make('workspace')->components([
                            TextEntry::make('name')->label(__('lavertia.workspace'))->value('Lavertia Playground'),
                            TextEntry::make('backend')->label('Backend')->value('Laravel + Inertia'),
                            TextEntry::make('interface')->label('UI')->value('PHP Components'),
                            TextEntry::make('model')->label('Model demo')->value('/admin/model-demo'),
                        ]),
                        Action::make('model')->label(__('lavertia.model_demo'))->appearance('primary')->url('/admin/model-demo'),
                    ]),
                ]),
        ];
    }
}
