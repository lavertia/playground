import { Link, usePage } from '@inertiajs/react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import AppLogo from '@/components/app-logo';
import { PanelSearch } from '@/components/panel-search';
import { ShellNavigationSlots } from '@/components/shell-navigation-slots';
import { PanelNotifications } from '@/components/panel-notifications';
import { PanelLocaleSwitcher } from '@/components/panel-locale-switcher';
import { TeamSwitcher } from '@/components/team-switcher';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { NavigationLink, PanelAppearance } from '@/components/lavertia/types';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
    showSidebarTrigger = true,
}: {
    breadcrumbs?: BreadcrumbItemType[];
    showSidebarTrigger?: boolean;
}) {
    const { props } = usePage();
    const panel = props.lavertiaPanel as PanelAppearance | null | undefined;
    const links = (props.lavertiaSidebar ?? []) as NavigationLink[];
    const current = links.find((link) => link.active);
    const pageBreadcrumbs = breadcrumbs.length > 0
        ? breadcrumbs
        : current ? [{ title: current.label, href: current.url }] : [];

    return (
        <header className={[
            'flex min-h-14 shrink-0 flex-wrap items-center gap-3 border-b border-sidebar-border/50 px-4 py-2 transition-[width,height] md:px-6',
            panel?.stickyHeader ? 'sticky top-0 z-30 bg-background/95 backdrop-blur' : '',
        ].join(' ')}>
            <div className="flex min-w-0 items-center gap-2">
                {showSidebarTrigger && <SidebarTrigger className="-ms-1" aria-label="Toggle navigation" />}
                {panel?.brandLogoDisplay !== 'hidden'
                    && (panel?.brandLogoPlacement === 'topbar' || panel?.brandLogoPlacement === 'both')
                    && <Link href="/admin/dashboard" aria-label={panel.brandName} className="flex min-w-0 items-center gap-2 rounded-md p-1 hover:bg-accent"><AppLogo compact /></Link>}
                {panel?.breadcrumbs !== false && panel?.topbar !== false && (
                    <Breadcrumbs breadcrumbs={pageBreadcrumbs} />
                )}
            </div>
            {panel?.navigationPosition === 'top' && panel.topbar !== false && (
                <nav aria-label="Panel navigation" className="order-3 flex w-full min-w-0 flex-wrap items-center gap-1 md:order-none md:ms-auto md:w-auto">
                    {links.map((item) => (
                        <Link
                            key={item.slug}
                            href={item.url}
                            aria-current={item.active ? 'page' : undefined}
                            className={[
                                'rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                                item.active ? 'bg-accent font-semibold text-accent-foreground' : 'text-muted-foreground',
                            ].join(' ')}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            )}
            {panel?.topbar !== false && (
                <div className="ms-auto flex shrink-0 items-center gap-1">
                    {panel?.tenantSwitcher !== false && panel?.tenantSwitcherPlacement === 'topbar' && (
                        <TeamSwitcher inHeader />
                    )}
                    <ShellNavigationSlots position="topbar" />
                    <PanelLocaleSwitcher />
                    {panel?.globalSearch === true && <PanelSearch />}
                    {panel?.notifications === true && <PanelNotifications />}
                </div>
            )}
        </header>
    );
}
