<?php

declare(strict_types=1);

namespace App\Lavertia\Pages;

use App\Lavertia\Components\CommerceTablesLab;
use Lavertia\Panels\Components\Action;
use Lavertia\Panels\Components\PageHeader;
use Lavertia\Panels\Pages\Page;
use Lavertia\Support\Contracts\Component;

final class CommerceTablesLabPage extends Page
{
    public static function slug(): string
    {
        return 'commerce-tables-lab';
    }

    public static function title(): string
    {
        return 'Commerce Tables Lab';
    }

    /** @return list<Component> */
    protected function components(): array
    {
        return [
            PageHeader::make('Commerce Tables Lab')
                ->eyebrow('Lavertia / Filament 5 Tables reference')
                ->description('Try Products, Orders, status tabs, summaries, columns and nested AND/OR query filters on fictional records.')
                ->actions([
                    Action::make('tables-ui-lab')
                        ->label('Open Users & Posts Lab')
                        ->appearance('outline')
                        ->url('/admin/filament-tables-lab'),
                    Action::make('tables-real')
                        ->label('Real Eloquent Table')
                        ->appearance('outline')
                        ->url('/admin/tables-showcase'),
                ]),
            CommerceTablesLab::make(),
        ];
    }
}
