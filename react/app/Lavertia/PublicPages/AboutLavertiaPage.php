<?php

declare(strict_types=1);

namespace App\Lavertia\PublicPages;

use Lavertia\Panels\Components\PageHeader;
use Lavertia\Panels\Components\Section;
use Lavertia\Panels\Pages\FlatPage;
use Lavertia\Support\Contracts\Component;

final class AboutLavertiaPage extends FlatPage
{
    public static function title(): string
    {
        return 'Lavertia Public Page';
    }

    /** @return array{title: string, description: string, robots: string, canonical: string} */
    protected function seo(): array
    {
        return [
            'title' => 'Lavertia — Composable Laravel Pages',
            'description' => 'A public page composed with Lavertia PHP widgets and rendered using Inertia.',
            'robots' => 'index,follow',
            'canonical' => '/lavertia-demo',
        ];
    }

    /** @return list<Component> */
    protected function components(): array
    {
        return [
            PageHeader::make('Public Lavertia Page')
                ->description('This page is not connected to an admin Panel.'),
            Section::make('Standalone and SEO-aware')
                ->description('Head metadata is provided by Laravel and rendered by the Inertia adapter.'),
        ];
    }
}
