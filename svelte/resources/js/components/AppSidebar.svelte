<script lang="ts">
    import { Link, page } from '@inertiajs/svelte';
    import BookOpen from '@lucide/svelte/icons/book-open';
    import Link2 from '@lucide/svelte/icons/link-2';
    import FileText from '@lucide/svelte/icons/file-text';
    import LayoutGrid from '@lucide/svelte/icons/layout-grid';
    import Bell from '@lucide/svelte/icons/bell';
    import Briefcase from '@lucide/svelte/icons/briefcase';
    import Calendar from '@lucide/svelte/icons/calendar';
    import ChartColumn from '@lucide/svelte/icons/chart-column';
    import FileChartColumn from '@lucide/svelte/icons/file-chart-column';
    import Folder from '@lucide/svelte/icons/folder';
    import House from '@lucide/svelte/icons/house';
    import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
    import List from '@lucide/svelte/icons/list';
    import Receipt from '@lucide/svelte/icons/receipt';
    import Settings from '@lucide/svelte/icons/settings';
    import Shield from '@lucide/svelte/icons/shield';
    import Users from '@lucide/svelte/icons/users';
    import Wallet from '@lucide/svelte/icons/wallet';
    import type { Snippet } from 'svelte';
    import AppLogo from '@/components/AppLogo.svelte';
    import NavFooter from '@/components/NavFooter.svelte';
    import NavMain from '@/components/NavMain.svelte';
    import NavUser from '@/components/NavUser.svelte';
    import TeamSwitcher from '@/components/TeamSwitcher.svelte';
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
    import type { NavItem, Team } from '@/types';
    import type { NavigationLink, PanelAppearance } from '@/components/lavertia/types';

    const navigationIcons = {
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
    } as const;

    let { children }: { children?: Snippet } = $props();
    const { isMobile, setOpenMobile } = useSidebar();

    const currentTeam = $derived(page.props.currentTeam as Team | null);
    const starterDashboard = $derived(
        currentTeam ? dashboard(currentTeam.slug) : '/',
    );

    let panel = $derived(page.props.lavertiaPanel as PanelAppearance | null | undefined);
    let panelLinks = $derived((page.props.lavertiaSidebar ?? []) as NavigationLink[]);

    const mainNavItems = $derived<NavItem[]>([
        ...(!panelLinks.some((item) => item.slug === 'dashboard')
            ? [{ title: 'Lavertia overview', href: '/admin/dashboard', icon: LayoutGrid }]
            : []),
        {
            title: 'Starter dashboard',
            href: starterDashboard,
            icon: BookOpen,
        },
    ]);

    let panelGroups = $derived.by(() => {
        const links = panelLinks;
        const groups: Array<{ label: string; items: NavigationLink[] }> = [];
        for (const item of links) {
            const label = item.group || 'Lavertia';
            const group = groups.find((entry) => entry.label === label);
            if (group) group.items.push(item);
            else groups.push({ label, items: [item] });
        }
        return groups;
    });

    let footerNavItems = $derived<NavItem[]>((panel?.footerLinks ?? []).map(item => ({
        title: item.label,
        href: item.url,
        icon: Link2,
    })));
</script>

<Sidebar
    collapsible={panel?.sidebarCollapsible === false ? 'none' : 'icon'}
    variant={panel?.sidebarVariant ?? 'inset'}
    side={page.props.lavertiaSidebarDirection === 'rtl' ? 'right' : 'left'}
    style={`--sidebar-primary: ${panel?.primaryColor ?? '#f59e0b'}; --sidebar-primary-foreground: ${panel?.primaryForeground ?? '#111827'}; --sidebar-width: ${panel?.sidebarWidth ?? '18rem'};`}
>
    <SidebarHeader>
        {#if panel?.brandLogoDisplay !== 'hidden' && panel?.brandLogoPlacement !== 'topbar'}
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                    {#snippet children(props)}
                        <Link {...props} href="/admin/dashboard" class={props.class}>
                            <AppLogo />
                        </Link>
                    {/snippet}
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
        {/if}
        {#if panel?.tenantSwitcher !== false && panel?.tenantSwitcherPlacement !== 'topbar'}
        <SidebarMenu>
            <SidebarMenuItem>
                <TeamSwitcher />
            </SidebarMenuItem>
        </SidebarMenu>
        {/if}
    </SidebarHeader>

    <SidebarContent>
        <NavMain items={mainNavItems} />
        {#each ((panel?.navigationPosition !== 'top' || $isMobile) && (panel?.mobileNavigation !== false || !$isMobile) ? panelGroups : []) as group (group.label)}
            <SidebarGroup class="px-2 py-0">
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarMenu>
                    {#each group.items as item (item.slug)}
                        {@const NavIcon = navigationIcons[item.icon as keyof typeof navigationIcons] ?? (item.slug === 'dashboard' ? LayoutGrid : FileText)}
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={item.active} tooltip={item.label}>
                                {#snippet children(props)}
                                    <Link {...props} href={item.url} aria-current={item.active ? 'page' : undefined} class={props.class}
                                        onclick={() => { if ($isMobile) setOpenMobile(false); }}>
                                        <NavIcon class="size-4 shrink-0" aria-hidden="true" />
                                        <span class="truncate">{item.label}</span>
                                        {#if item.badge}
                                            <span class="ms-auto shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">{item.badge}</span>
                                        {/if}
                                    </Link>
                                {/snippet}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    {/each}
                </SidebarMenu>
            </SidebarGroup>
        {/each}
    </SidebarContent>

    <SidebarFooter>
        {#if footerNavItems.length > 0}
            <NavFooter items={footerNavItems} />
        {/if}
        <NavUser />
    </SidebarFooter>
</Sidebar>
{@render children?.()}
