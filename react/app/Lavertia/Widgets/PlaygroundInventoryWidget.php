<?php

declare(strict_types=1);

namespace App\Lavertia\Widgets;

use Lavertia\Panels\Components\Stat;
use Lavertia\Panels\Components\StatsGrid;
use Lavertia\Panels\Widgets\DashboardWidget;
use Lavertia\Support\Contracts\Component;

final class PlaygroundInventoryWidget extends DashboardWidget
{
    public static function sort(): int
    {
        return 30;
    }

    public function canView(): bool
    {
        return auth()->check();
    }

    /** @return list<Component> */
    protected function components(): array
    {
        return [
            StatsGrid::make([
                Stat::make('Modular Widgets', 'v0.3')
                    ->description('Example registered dashboard widget')
                    ->tone('neutral'),
            ]),
        ];
    }
}
