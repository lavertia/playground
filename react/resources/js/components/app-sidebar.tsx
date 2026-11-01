import { Link, usePage } from '@inertiajs/react';
import { createElement } from 'react';
import {
    Bell, BookOpen, Briefcase, Calendar, ChartColumn, FileChartColumn, FileText,
    Folder, House, LayoutDashboard, LayoutGrid, Link2, List, Receipt, Settings,
    Shield, Users, Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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

const navigationIcons: Record<string, LucideIcon> = {
    bell: Bell,
    'book-open': BookOpen,
    briefcase: Briefcase,
    calendar: Calendar,
    'chart-column': ChartColumn,
    'file-chart-column': FileChartColumn,
    'file-text': FileText,
    folder: Folder,
    house: House,
    'layout-dashboard': LayoutDashboard,
    list: List,
    receipt: Receipt,
    settings: Settings,
    shield: Shield,
    users: Users,
    wallet: Wallet,
};

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
                                            {createElement(navigationIcons[item.icon ?? ''] ?? (item.slug === 'dashboard' ? LayoutGrid : FileText), {
                                                'aria-hidden': true,
                                                className: 'size-4 shrink-0',
                                            })}
                                            <span className="truncate">{item.label}</span>
                                            {item.badge && (
                                                <span className="ms-auto shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">
                                                    {item.badge}
                                                </span>
                                            )}
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
