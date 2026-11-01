<?php

declare(strict_types=1);

namespace App\Lavertia\Pages;

use Lavertia\Panels\Components\Action;
use Lavertia\Panels\Components\PageHeader;
use Lavertia\Panels\Components\Section;
use Lavertia\Panels\Pages\Page;
use Lavertia\Support\Contracts\Component;

final class FullScreenDemoPage extends Page
{
    public static function slug(): string
    {
        return 'fullscreen-demo';
    }

    public static function title(): string
    {
        return 'Full-screen Page';
    }

    public static function layout(): ?string
    {
        return 'full';
    }

    /** Restrict this Page without changing the language choices on other Pages. */
    public static function locales(): ?array
    {
        return ['en', 'ar'];
    }

    /** @return list<Component> */
    protected function components(): array
    {
        return [
            PageHeader::make('Full-screen Page')
                ->description('This Page hides the Panel sidebar and top bar.')
                ->actions([
                    Action::make('return-to-panel')
                        ->label('Back to dashboard')
                        ->url('/admin/dashboard'),
                ]),
            Section::make('Independent workspace')
                ->description('The Panel still controls authentication and permissions.'),
        ];
    }
}
