<script lang="ts">
    import { Link, page } from '@inertiajs/svelte';
    import BookOpen from '@lucide/svelte/icons/book-open';
    import Link2 from '@lucide/svelte/icons/link-2';
    import FileText from '@lucide/svelte/icons/file-text';
    import LayoutGrid from '@lucide/svelte/icons/layout-grid';
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
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={item.active} tooltip={item.label}>
                                {#snippet children(props)}
                                    <Link {...props} href={item.url} aria-current={item.active ? 'page' : undefined} class={props.class}
                                        onclick={() => { if ($isMobile) setOpenMobile(false); }}>
                                        {#if item.slug === 'dashboard'}
                                            <LayoutGrid class="size-4 shrink-0" />
                                        {:else}
                                            <FileText class="size-4 shrink-0" />
                                        {/if}
                                        <span>{item.label}</span>
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
