<?php

declare(strict_types=1);

namespace App\Lavertia\Pages;

use App\Models\User;
use Lavertia\Panels\Components\PageHeader;
use Lavertia\Panels\Components\SelectFilter;
use Lavertia\Panels\Components\Table;
use Lavertia\Panels\Components\TextColumn;
use Lavertia\Panels\Pages\Page;
use Lavertia\Support\Contracts\Component;

final class ModelDemoPage extends Page
{
    public static function slug(): string
    {
        return 'model-demo';
    }

    /** @return list<Component> */
    protected function components(): array
    {
        return [
            PageHeader::make(__('lavertia.model_demo'))
                ->description(__('lavertia.model_hint')),

            Table::make('users')
                ->label(__('lavertia.model_demo'))
                ->searchable()
                ->columnManager()
                ->filters([
                    SelectFilter::make('name')
                        ->label(__('lavertia.name'))
                        ->options([auth()->user()->name => auth()->user()->name]),
                ])
                ->columns([
                    TextColumn::make('name')->label(__('lavertia.name'))->sortable()->searchable(),
                    TextColumn::make('email')->label('Email')->sortable()->searchable()->toggleable(),
                ])
                ->eloquent(
                    // Only the authenticated user's record can be fetched.
                    User::query()->whereKey(auth()->id()),
                    fn (): bool => auth()->check(),
                    perPage: 5,
                ),
        ];
    }
}
