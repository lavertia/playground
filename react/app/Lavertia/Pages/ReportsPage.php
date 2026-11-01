<?php

declare(strict_types=1);

namespace App\Lavertia\Pages;

use Lavertia\Panels\Components\PageHeader;
use Lavertia\Panels\Components\Section;
use Lavertia\Panels\Pages\Page;
use Lavertia\Support\Contracts\Component;

final class ReportsPage extends Page
{
    public static function slug(): string
    {
        return 'reports';
    }

    public static function title(): string
    {
        return 'Reports';
    }

    /** @return list<Component> */
    protected function components(): array
    {
        return [
            PageHeader::make('Reports')
                ->description('Manage Reports.'),

            Section::make('Reports')
                ->description('Build your page with Lavertia components.'),
        ];
    }
}
