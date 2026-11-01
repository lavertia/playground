import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FileText, LayoutGrid, Link2 } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import type { NavigationLink, PanelAppearance } from '@/components/lavertia/types';

export function AppSidebar() {
    const page = usePage();
    const panel = page.props.lavertiaPanel as PanelAppearance | null | undefined;
    const { isMobile, setOpenMobile } = useSidebar();
    const starterDashboard = page.props.currentTeam
        ? dashboard(page.props.currentTeam.slug)
        : '/';

    const panelLinks = (page.props.lavertiaSidebar ?? []) as NavigationLink[];

    const mainNavItems: NavItem[] = [
        ...(!panelLinks.some((item) => item.slug === 'dashboard')
            ? [{ title: 'Lavertia overview', href: '/admin/dashboard', icon: LayoutGrid }]
            : []),
        {
            title: 'Starter dashboard',
            href: starterDashboard,
            icon: BookOpen,
        },
    ];

    const panelGroups = panelLinks.reduce<Array<{ label: string; items: NavigationLink[] }>>((groups, item) => {
        const label = item.group || 'Lavertia';
        const group = groups.find((entry) => entry.label === label);
        if (group) group.items.push(item);
        else groups.push({ label, items: [item] });
        return groups;
    }, []);

    const footerNavItems: NavItem[] = (panel?.footerLinks ?? []).map((item) => ({
        title: item.label,
        href: item.url,
        icon: Link2,
    }));

    const logoInSidebar = panel?.brandLogoDisplay !== 'hidden'
        && (panel?.brandLogoPlacement ?? 'sidebar') !== 'topbar';

    return (
        <Sidebar
            collapsible={panel?.sidebarCollapsible === false ? 'none' : 'icon'}
            variant={panel?.sidebarVariant ?? 'inset'}
            side={page.props.lavertiaSidebarDirection === 'rtl' ? 'right' : 'left'}
            style={{ '--sidebar-primary': panel?.primaryColor ?? '#f59e0b', '--sidebar-width': panel?.sidebarWidth ?? '18rem' } as React.CSSProperties}
        >
            <SidebarHeader>
                {logoInSidebar && (
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild tooltip={{ children: panel?.brandName ?? 'Lavertia' }}>
                                <Link href="/admin/dashboard" prefetch>
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                )}
                {panel?.tenantSwitcher !== false && panel?.tenantSwitcherPlacement !== 'topbar' && (
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <TeamSwitcher />
                        </SidebarMenuItem>
                    </SidebarMenu>
                )}
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                {(panel?.navigationPosition !== 'top' || isMobile) && (panel?.mobileNavigation !== false || !isMobile) && panelGroups.map((group) => (
                    <SidebarGroup className="px-2 py-0" key={group.label}>
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        <SidebarMenu>
                            {group.items.map((item) => (
                                <SidebarMenuItem key={item.slug}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={item.active}
                                        tooltip={{ children: item.label }}
                                    >
                                        <Link href={item.url} aria-current={item.active ? 'page' : undefined} prefetch
                                            onClick={() => { if (isMobile) setOpenMobile(false); }}>
                                            {item.slug === 'dashboard' ? <LayoutGrid /> : <FileText />}
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                {footerNavItems.length > 0 && <NavFooter items={footerNavItems} className="mt-auto" />}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
