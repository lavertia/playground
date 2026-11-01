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
    import ChevronDown from '@lucide/svelte/icons/chevron-down';
    import type { Snippet } from 'svelte';
    import AppLogo from '@/components/AppLogo.svelte';
    import NavFooter from '@/components/NavFooter.svelte';
    import NavMain from '@/components/NavMain.svelte';
    import NavUser from '@/components/NavUser.svelte';
    import ShellNavigationSlots from '@/components/ShellNavigationSlots.svelte';
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
    import { panelNavigationGroups } from '@/components/lavertia/types';
    import type { NavigationLink, NavigationGroupView, PanelAppearance } from '@/components/lavertia/types';

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
    const { state: sidebarState, isMobile, setOpenMobile } = useSidebar();
    let groupOpen = $state<Record<string, boolean>>({});

    function groupExpanded(group: NavigationGroupView): boolean {
        return !group.collapsible || group.active
            || ($sidebarState === 'collapsed' && !$isMobile)
            || (groupOpen[group.label] ?? !group.collapsedByDefault);
    }

    function toggleGroup(group: NavigationGroupView): void {
        groupOpen = {
            ...groupOpen,
            [group.label]: !(groupOpen[group.label] ?? !group.collapsedByDefault),
        };
    }

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

    let panelGroups = $derived(panelNavigationGroups(panelLinks, panel?.navigationGroups));

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
        <ShellNavigationSlots position="tenant" />
        <ShellNavigationSlots position="icon-rail" />
    </SidebarHeader>

    <SidebarContent>
        <NavMain items={mainNavItems} />
        {#each ((panel?.navigationPosition !== 'top' || $isMobile) && (panel?.mobileNavigation !== false || !$isMobile) ? panelGroups : []) as group (group.label)}
            <SidebarGroup class="px-2 py-0">
                <SidebarGroupLabel>
                    {#if group.collapsible}
                        <button type="button" class="flex w-full items-center justify-between gap-2 text-start focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring group-data-[collapsible=icon]:hidden"
                            aria-expanded={groupExpanded(group)} onclick={() => toggleGroup(group)}>
                            <span class="truncate">{group.label}</span>
                            <ChevronDown class={`size-3.5 shrink-0 transition-transform ${groupExpanded(group) ? '' : '-rotate-90'}`} aria-hidden="true" />
                        </button>
                    {:else}
                        {group.label}
                    {/if}
                </SidebarGroupLabel>
                {#if groupExpanded(group)}
                <SidebarMenu>
                    {#each group.items as item (item.slug)}
                        {@const NavIcon = navigationIcons[item.icon as keyof typeof navigationIcons] ?? (item.slug === 'dashboard' ? LayoutGrid : FileText)}
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={item.active} tooltip={item.label}
                                class={item.parentSlug ? 'ps-5 group-data-[collapsible=icon]:ps-0' : undefined}>
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
                {/if}
            </SidebarGroup>
        {/each}
        <ShellNavigationSlots position="sidebar" />
    </SidebarContent>

    <SidebarFooter>
        <ShellNavigationSlots position="footer" />
        {#if footerNavItems.length > 0}
            <NavFooter items={footerNavItems} />
        {/if}
        <NavUser />
    </SidebarFooter>
</Sidebar>
{@render children?.()}
