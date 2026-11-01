<?php

declare(strict_types=1);

namespace App\Providers\Lavertia;

use Lavertia\Panels\Http\Middleware\ResolveLocale;
use Lavertia\Panels\Navigation\NavigationItem;
use Lavertia\Panels\Panel;
use Lavertia\Panels\PanelProvider;

final class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->id('admin')
            ->path('admin')
            ->middleware([
                'web',
                'auth',
                ResolveLocale::class,
            ])

            // Branding
            ->brandName('Lavertia')
            ->brandSubtitle('Administration')
            ->brandLogo('/images/logo.svg')
            ->primaryColor('#2563eb')

            // Theme
            ->themeMode('system')
            ->fontFamily('Inter')
            ->borderRadius('lg')
            ->contentWidth('full')

            // Sidebar & navigation
            ->sidebarVariant('inset')
            ->sidebarWidth('18rem')
            ->sidebarCollapsible()
            ->navigationPosition('sidebar')
            ->mobileNavigation()

            // Header
            ->topbar()
            ->breadcrumbs()
            ->stickyHeader()

            // Pages
            ->discoverPages(
                app_path('Lavertia/Pages'),
                'App\\Lavertia\\Pages',
            )

            // Navigation
            ->navigationItems([
                NavigationItem::make('dashboard', 'Dashboard'),

                NavigationItem::make('invoices', 'Invoices')
                    ->group('Management'),

                NavigationItem::make('reports', 'Reports')
                    ->group('Management'),
            ])

            // Extensions
            ->plugins([]);
    }
}
