import { Link, usePage } from '@inertiajs/react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { NavigationLink, PanelAppearance } from '@/components/lavertia/types';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
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
                <SidebarTrigger className="-ms-1" aria-label="Toggle navigation" />
                {panel?.breadcrumbs !== false && panel?.topbar !== false && (
                    <Breadcrumbs breadcrumbs={pageBreadcrumbs} />
                )}
            </div>
            {panel?.navigationPosition === 'top' && panel.topbar !== false && (
                <nav aria-label="Panel navigation" className="ms-auto hidden min-w-0 flex-wrap items-center gap-1 md:flex">
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
        </header>
    );
}
