<?php

declare(strict_types=1);

namespace App\Lavertia\Pages;

use Lavertia\Panels\Components\PageHeader;
use Lavertia\Panels\Components\Action;
use Lavertia\Panels\Components\Section;
use Lavertia\Panels\Pages\Page;
use Lavertia\Support\Contracts\Component;

final class ReportsPage extends Page
{
    public static function slug(): string
    {
        return 'reports';
    }

    /** A Page may override its Panel's sidebar-only layout. */
    public static function layout(): ?string
    {
        return 'top';
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
                ->description('Manage Reports.')
                ->breadcrumbs([
                    ['label' => 'Dashboard', 'url' => '/admin/dashboard'],
                    ['label' => 'Reports'],
                ])
                ->tabs([
                    ['label' => 'Overview', 'url' => '/admin/reports', 'active' => true],
                    ['label' => 'Billing', 'url' => '/admin/billing/reports'],
                ])
                ->actions([
                    Action::make('billing-reports')
                        ->label('Billing reports')
                        ->url('/admin/billing/reports'),
                ]),

            Section::make('Reports')
                ->description('Build your page with Lavertia components.'),
        ];
    }
}
