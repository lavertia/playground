<?php

declare(strict_types=1);

namespace App\Lavertia\Pages;

use Lavertia\Panels\Components\PageHeader;
use Lavertia\Panels\Components\Section;
use Lavertia\Panels\Pages\Page;
use Lavertia\Support\Contracts\Component;

final class WorkspaceDemoPage extends Page
{
    public static function slug(): string
    {
        return 'workspace-demo';
    }

    public static function title(): string
    {
        return 'Workspace layout';
    }

    public static function layout(): ?string
    {
        return 'workspace';
    }

    /** @return list<Component> */
    protected function components(): array
    {
        return [
            PageHeader::make('Workspace layout')
                ->description('Use context widgets alongside navigation without changing the Panel.'),
            Section::make('Composable workspace')
                ->description('Topbar, sidebar, context and footer share the same server-controlled widget contract.'),
        ];
    }
}
