<?php

declare(strict_types=1);

namespace App\Lavertia\Pages;

use Lavertia\Panels\Components\PageHeader;
use Lavertia\Panels\Components\Stat;
use Lavertia\Panels\Components\StatsGrid;
use Lavertia\Panels\Pages\Page;
use Lavertia\Support\Contracts\Component;

final class InventoryOverview extends Page
{
    public static function slug(): string
    {
        return 'inventory/overview';
    }

    public static function title(): string
    {
        return 'Inventory demo';
    }

    /** @return list<Component> */
    protected function components(): array
    {
        return [
            PageHeader::make('Inventory demo')
                ->description('Example module-ready navigation destination. All values are illustrative.'),

            StatsGrid::make([
                Stat::make('Locations', 3)->description('Sample only')->tone('primary'),
                Stat::make('Items', 12)->description('Sample only')->tone('success'),
            ]),
        ];
    }
}
