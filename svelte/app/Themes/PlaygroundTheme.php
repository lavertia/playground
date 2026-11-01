<?php

declare(strict_types=1);

namespace App\Themes;

use Lavertia\Panels\Themes\PanelTheme;

final class PlaygroundTheme implements PanelTheme
{
    public function id(): string
    {
        return 'playground';
    }

    /** @return array<string, string> */
    public function tokens(): array
    {
        return [
            'primary' => '#b45309',
            'primary-foreground' => '#ffffff',
            'ring' => '#d97706',
            'sidebar-primary' => '#b45309',
            'sidebar-primary-foreground' => '#ffffff',
        ];
    }
}
