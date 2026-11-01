<?php

declare(strict_types=1);

namespace App\Providers\Lavertia;

use Lavertia\Panels\Navigation\NavigationItem;
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
            ->sidebarCollapsible()
            ->themeMode('system')
            ->contentWidth('full')
            ->sidebarWidth('18rem')
            ->navigationPosition('sidebar')
            ->topbar()
            ->breadcrumbs()
            ->mobileNavigation()
            ->discoverPages(app_path('Lavertia/Pages'), 'App\\Lavertia\\Pages')
            ->navigationItems([
                NavigationItem::make('dashboard', 'Dashboard'),
                NavigationItem::make('invoices', 'Invoices')->group('Management'),
                NavigationItem::make('reports', 'Reports')->group('Management'),
                NavigationItem::make('billing/reports', 'Billing Reports')->group('Billing'),
            ]);
    }
}
