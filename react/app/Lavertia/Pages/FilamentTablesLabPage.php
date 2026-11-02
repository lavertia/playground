<?php

declare(strict_types=1);

namespace App\Lavertia\Pages;

use App\Lavertia\Components\FilamentTablesLab;
use Lavertia\Panels\Components\Action;
use Lavertia\Panels\Components\PageHeader;
use Lavertia\Panels\Pages\Page;
use Lavertia\Support\Contracts\Component;

final class FilamentTablesLabPage extends Page
{
    public static function slug(): string
    {
        return 'filament-tables-lab';
    }

    public static function title(): string
    {
        return 'Filament Tables Lab';
    }

    /** @return list<Component> */
    protected function components(): array
    {
        return [
            PageHeader::make('Filament Tables Lab')
                ->eyebrow('Lavertia / React Playground')
                ->description('Explore Filament-inspired table layouts, toolbar controls and interactive states. All edits here affect fictional, browser-only records.')
                ->actions([
                    Action::make('lavertia-table-engine')
                        ->label('Test real Lavertia Table')
                        ->appearance('outline')
                        ->url('/admin/tables-showcase'),
                    Action::make('filament-table-docs')
                        ->label('Filament 5 reference')
                        ->appearance('outline')
                        ->url('https://filamentphp.com/docs/5.x/tables/overview'),
                ]),
            FilamentTablesLab::make(),
        ];
    }
}
