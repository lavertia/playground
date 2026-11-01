<?php

declare(strict_types=1);

namespace Lavertia\ThemeDefault;

use Lavertia\Panels\Themes\PanelTheme;

final class ClassicTheme implements PanelTheme
{
    public function id(): string
    {
        return 'classic';
    }

    /** @return array<string, string> */
    public function tokens(): array
    {
        return [
            'primary' => '#b45309',
            'primary-foreground' => '#ffffff',
            'sidebar-primary' => '#b45309',
            'sidebar-primary-foreground' => '#ffffff',
            'ring' => '#d97706',
        ];
    }
}
