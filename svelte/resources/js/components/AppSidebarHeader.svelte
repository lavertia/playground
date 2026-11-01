<script lang="ts">
    import { Link, page } from '@inertiajs/svelte';
    import Breadcrumbs from '@/components/Breadcrumbs.svelte';
    import { SidebarTrigger } from '@/components/ui/sidebar';
    import type { NavigationLink, PanelAppearance } from '@/components/lavertia/types';
    import type { BreadcrumbItem } from '@/types';

    let { breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItem[] } = $props();
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
        <SidebarTrigger class="-ms-1" aria-label="Toggle navigation" />
        {#if panel?.breadcrumbs !== false && panel?.topbar !== false}
            <Breadcrumbs breadcrumbs={resolvedBreadcrumbs} />
        {/if}
    </div>
    {#if panel?.navigationPosition === 'top' && panel?.topbar !== false}
        <nav aria-label="Panel navigation" class="ms-auto hidden min-w-0 flex-wrap items-center gap-1 md:flex">
            {#each links as item (item.slug)}
                <Link href={item.url} aria-current={item.active ? 'page' : undefined}
                    class={`rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${item.active ? 'bg-accent font-semibold text-accent-foreground' : 'text-muted-foreground'}`}
                >{item.label}</Link>
            {/each}
        </nav>
    {/if}
</header>
