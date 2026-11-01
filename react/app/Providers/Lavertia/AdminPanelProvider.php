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
            ->brandLogoDisplay('full')
            ->brandLogoPlacement('sidebar')
            ->tenantSwitcher()
            ->tenantSwitcherPlacement('sidebar')
            ->globalSearch()
            ->notifications()
            ->footerLinks([
                ['label' => 'Source repository', 'url' => 'https://github.com/lavertia/playground', 'external' => true],
                ['label' => 'Lavertia project', 'url' => 'https://github.com/lavertia/lavertia', 'external' => true],
            ])
            ->userMenuSettings()
            ->userMenuLogout()
            ->userMenuLinks([
                ['label' => 'Lavertia documentation', 'url' => 'https://github.com/lavertia/lavertia', 'external' => true],
            ])
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
                NavigationItem::make('dashboard', 'Dashboard')->icon('layout-dashboard'),
                NavigationItem::make('invoices', 'Invoices')->icon('receipt')->group('Management'),
                NavigationItem::make('reports', 'Reports')->icon('chart-column')->group('Management'),
                NavigationItem::make('billing/reports', 'Billing Reports')->icon('file-chart-column')->badge('New')->group('Billing'),
            ]);
    }
}
