<?php

declare(strict_types=1);

namespace App\Providers\Lavertia;

use App\Themes\PlaygroundTheme;
use Lavertia\Panels\Navigation\NavigationGroup;
use Lavertia\Panels\Navigation\NavigationItem;
use Lavertia\Panels\Navigation\NavigationSlot;
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
            ->locales(['en', 'ar', 'fr'])
            ->defaultLocale('en')
            ->theme(new PlaygroundTheme)
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
            ->pages([\App\Lavertia\Pages\DashboardPage::class])
            ->navigationGroups([
                ['label' => 'Workspace', 'sort' => 0, 'collapsible' => true, 'collapsedByDefault' => false],
            ])
            ->navigationItems([
                NavigationItem::make('dashboard', 'Dashboard')->icon('layout-dashboard')->badge('Demo')->group('Workspace'),
            ]);
    }
}
