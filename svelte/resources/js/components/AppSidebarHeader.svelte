<script lang="ts">
    import { Link, page } from '@inertiajs/svelte';
    import Breadcrumbs from '@/components/Breadcrumbs.svelte';
    import AppLogo from '@/components/AppLogo.svelte';
    import TeamSwitcher from '@/components/TeamSwitcher.svelte';
    import PanelSearch from '@/components/PanelSearch.svelte';
    import ShellNavigationSlots from '@/components/ShellNavigationSlots.svelte';
    import PanelNotifications from '@/components/PanelNotifications.svelte';
    import PanelLocaleSwitcher from '@/components/PanelLocaleSwitcher.svelte';
    import { SidebarTrigger } from '@/components/ui/sidebar';
    import type { NavigationLink, PanelAppearance } from '@/components/lavertia/types';
    import type { BreadcrumbItem } from '@/types';

    let { breadcrumbs = [], showSidebarTrigger = true }: { breadcrumbs?: BreadcrumbItem[]; showSidebarTrigger?: boolean } = $props();
    let panel = $derived(page.props.lavertiaPanel as PanelAppearance | null | undefined);
    let links = $derived((page.props.lavertiaSidebar ?? []) as NavigationLink[]);
    let active = $derived(links.find(item => item.active));
    let resolvedBreadcrumbs = $derived(
        breadcrumbs.length > 0 ? breadcrumbs : active ? [{ title: active.label, href: active.url }] : [],
    );
</script>

<header
    class={`flex min-h-14 shrink-0 flex-wrap items-center gap-3 border-b border-sidebar-border/70 px-4 py-2 md:px-6 ${panel?.stickyHeader ? 'sticky top-0 z-30 bg-background/95 backdrop-blur' : ''}`}
>
    <div class="flex min-w-0 items-center gap-2">
        {#if showSidebarTrigger}
            <SidebarTrigger class="-ms-1" />
        {/if}
        {#if panel?.brandLogoDisplay !== 'hidden' && (panel?.brandLogoPlacement === 'topbar' || panel?.brandLogoPlacement === 'both')}
            <Link href="/admin/dashboard" aria-label={panel?.brandName}
                class="flex items-center gap-2 rounded-md p-1 hover:bg-accent"><AppLogo compact /></Link>
        {/if}
        {#if panel?.breadcrumbs !== false && panel?.topbar !== false}
            <Breadcrumbs breadcrumbs={resolvedBreadcrumbs} />
        {/if}
    </div>
    {#if panel?.navigationPosition === 'top' && panel?.topbar !== false}
        <nav aria-label="Panel navigation" class="order-3 flex w-full min-w-0 flex-wrap items-center gap-1 md:order-none md:ms-auto md:w-auto">
            {#each links as item (item.slug)}
                <Link href={item.url} aria-current={item.active ? 'page' : undefined}
                    class={`rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${item.active ? 'bg-accent font-semibold text-accent-foreground' : 'text-muted-foreground'}`}
                >{item.label}</Link>
            {/each}
        </nav>
    {/if}
    {#if panel?.topbar !== false}
        <div class="ms-auto flex shrink-0 items-center gap-1">
            {#if panel?.tenantSwitcher !== false && panel?.tenantSwitcherPlacement === 'topbar'}
                <TeamSwitcher inHeader />
            {/if}
            <ShellNavigationSlots position="topbar" />
            <PanelLocaleSwitcher />
            {#if panel?.globalSearch}
                <PanelSearch />
            {/if}
            {#if panel?.notifications}
                <PanelNotifications />
            {/if}
        </div>
    {/if}
</header>
