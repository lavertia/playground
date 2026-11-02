<?php

declare(strict_types=1);

namespace App\Providers\Lavertia;

use App\Lavertia\Resources\DemoTicketResource;
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
            ->discoverPages(app_path('Lavertia/Pages'), 'App\\Lavertia\\Pages')
            ->resources([DemoTicketResource::class])
            ->navigationGroups([
                ['label' => 'Lavertia', 'sort' => 0],
                ['label' => 'Management', 'sort' => 10, 'collapsible' => true, 'collapsedByDefault' => true],
            ])
            ->shellSlots([
                NavigationSlot::make('quick-top')
                    ->position('topbar')
                    ->components([
                        NavigationItem::make('workspace-demo', 'Workspace')->icon('layout-dashboard'),
                    ]),
                NavigationSlot::make('module-rail')
                    ->position('icon-rail')
                    ->components([
                        NavigationItem::make('workspace-demo', 'Workspace')->icon('layout-dashboard'),
                    ]),
                NavigationSlot::make('context-tools')
                    ->position('context')
                    ->components([
                        NavigationGroup::make('Workspace tools')
                            ->components([
                                NavigationItem::make('fullscreen-demo', 'Fullscreen')->icon('house'),
                            ]),
                    ]),
                NavigationSlot::make('quick-footer')
                    ->position('footer')
                    ->components([
                        NavigationItem::make('workspace-demo', 'Workspace')->icon('layout-dashboard'),
                    ]),
            ])
            ->navigationItems([
                NavigationItem::make('dashboard', 'Dashboard')->icon('layout-dashboard'),
                NavigationItem::make('invoices', 'Invoices')->icon('receipt')->group('Management'),
                NavigationItem::make('reports', 'Reports')->icon('chart-column')->group('Management'),
                NavigationItem::make('billing/reports', 'Billing Reports')->icon('file-chart-column')->badge('New')->group('Management')->parent('reports'),
                NavigationItem::make('tickets-published', 'Published tickets')->icon('file-text')->group('Management')->resource('demo-tickets', 'published'),
                NavigationItem::make('tickets-drafts', 'Draft tickets')->icon('file-text')->group('Management')->resource('demo-tickets', 'drafts'),
                NavigationItem::make('tables-showcase', 'Tables Showcase')->icon('list')->group('Management'),
                NavigationItem::make('filament-tables-lab', 'Filament Tables Lab')->icon('list')->group('Management'),
                NavigationItem::make('commerce-tables-lab', 'Commerce Tables Lab')->icon('receipt')->group('Management'),
            ]);
    }
}
