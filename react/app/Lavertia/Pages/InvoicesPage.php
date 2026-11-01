<?php

declare(strict_types=1);

namespace App\Lavertia\Pages;

use Lavertia\Panels\Components\PageHeader;
use Lavertia\Panels\Components\Section;
use Lavertia\Panels\Pages\Page;
use Lavertia\Support\Contracts\Component;

final class InvoicesPage extends Page
{
    public static function slug(): string
    {
        return 'invoices';
    }

    public static function title(): string
    {
        return 'Invoices';
    }

    /** @return list<Component> */
    protected function components(): array
    {
        return [
            PageHeader::make('Invoices')
                ->description('Manage your invoices.'),

            Section::make('Invoice management')
                ->description('Your invoice workspace.'),
        ];
    }
}
