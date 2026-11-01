<?php

declare(strict_types=1);

namespace App\Providers\Lavertia;

use Lavertia\Panels\Panel;
use Lavertia\Panels\Http\Middleware\ResolveLocale;
use Lavertia\Panels\PanelProvider;

final class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->id('admin')
            ->middleware(['web', 'auth', ResolveLocale::class])
            ->brandName('Lavertia')
            ->brandSubtitle('Playground')
            ->primaryColor('#f59e0b')
            ->sidebarVariant('inset')
            ->sidebarCollapsible();
    }
}
