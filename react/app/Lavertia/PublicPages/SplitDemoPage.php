<?php

declare(strict_types=1);

namespace App\Lavertia\PublicPages;

use Lavertia\Panels\Components\PageHeader;
use Lavertia\Panels\Components\Section;
use Lavertia\Panels\Pages\SplitPage;
use Lavertia\Support\Contracts\Component;

final class SplitDemoPage extends SplitPage
{
    public static function title(): string
    {
        return 'Two-Column Lavertia Page';
    }

    protected function splitRatio(): string
    {
        return 'start-wide';
    }

    /** @return list<Component> */
    protected function leftComponents(): array
    {
        return [
            PageHeader::make('A two-column page'),
            Section::make('Primary content')->description('This area contains ordinary Lavertia widgets.'),
        ];
    }

    /** @return list<Component> */
    protected function rightComponents(): array
    {
        return [
            Section::make('Secondary content')->description('Perfect for an auth illustration or inspector.'),
        ];
    }
}
