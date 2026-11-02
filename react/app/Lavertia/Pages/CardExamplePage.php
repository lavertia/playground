<?php

declare(strict_types=1);

namespace App\Lavertia\Pages;

use Lavertia\Panels\Components\PageHeader;
use Lavertia\Panels\Components\Section;
use Lavertia\Panels\Pages\CardPage;
use Lavertia\Support\Contracts\Component;

final class CardExamplePage extends CardPage
{
    public static function slug(): string
    {
        return 'card-example';
    }

    public static function title(): string
    {
        return 'Centered Card Page';
    }

    protected function cardWidth(): string
    {
        return 'md';
    }

    /** @return list<Component> */
    protected function components(): array
    {
        return [
            PageHeader::make('Card layout'),
            Section::make('Reusable Page anatomy')
                ->description('Any auth, resource or custom Page can opt into the same presentation.'),
        ];
    }
}
