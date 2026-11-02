<script lang="ts">
    import type { Snippet } from 'svelte';
    import { page } from '@inertiajs/svelte';
    import { shellNavigationSlots, themeVariables } from '@/components/lavertia/types';
    import type { PanelAppearance } from '@/components/lavertia/types';
    import AppContent from '@/components/AppContent.svelte';
    import AppShell from '@/components/AppShell.svelte';
    import AppSidebar from '@/components/AppSidebar.svelte';
    import AppSidebarHeader from '@/components/AppSidebarHeader.svelte';
    import PanelLocaleSwitcher from '@/components/PanelLocaleSwitcher.svelte';
    import ShellNavigationSlots from '@/components/ShellNavigationSlots.svelte';
    import { Toaster } from '@/components/ui/sonner';
    import type { BreadcrumbItem } from '@/types';

    let {
        breadcrumbs = [],
        children,
    }: {
        breadcrumbs?: BreadcrumbItem[];
        children?: Snippet;
    } = $props();

    const maxWidths: Record<string, string> = { sm: '40rem', md: '48rem', lg: '64rem', xl: '80rem', '2xl': '96rem', full: 'none' };
    let panel = $derived(page.props.lavertiaPanel as PanelAppearance | null | undefined);
    let maxWidth = $derived(maxWidths[panel?.contentWidth ?? 'full']);
    let hasContext = $derived(panel?.layout === 'workspace' && shellNavigationSlots(panel, 'context').length > 0);
    let themeCss = $derived(Object.entries(themeVariables(panel)).map(([key, value]) => key + ':' + value).join(';'));
</script>

{#if panel?.layout === 'full'}
    <div class="relative min-h-screen w-full" data-panel-layout="full" data-lavertia-theme={panel.theme?.id ?? 'default'} style={themeCss}>
        {#if panel.languageSwitcher}
            <div class="absolute end-4 top-4 z-20"><PanelLocaleSwitcher /></div>
        {/if}
        {@render children?.()}
        <Toaster />
    </div>
{:else if panel?.layout === 'top'}
    <AppShell variant="header">
        <AppSidebarHeader {breadcrumbs} showSidebarTrigger={false} />
        <AppContent variant="header" class="min-w-0 w-full max-w-none overflow-x-clip">
            <div class="mx-auto w-full min-w-0 flex-1" style:max-width={maxWidth}>
                {@render children?.()}
            </div>
        </AppContent>
        <Toaster />
    </AppShell>
{:else}
<AppShell variant="sidebar">
    <AppSidebar />
    <AppContent variant="sidebar" class="min-w-0 overflow-x-clip">
        <AppSidebarHeader {breadcrumbs} />
        <div class="flex min-w-0 flex-1">
            <div class="mx-auto w-full min-w-0 flex-1" style:max-width={maxWidth}>
                {@render children?.()}
            </div>
            {#if hasContext}
                <aside aria-label="Context navigation" class="hidden w-64 shrink-0 border-s border-border p-3 xl:block">
                    <ShellNavigationSlots position="context" />
                </aside>
            {/if}
        </div>
        {#if hasContext}
            <details class="mx-4 mb-4 rounded-md border border-border p-3 xl:hidden">
                <summary class="cursor-pointer text-sm font-semibold">Context navigation</summary>
                <ShellNavigationSlots position="context" />
            </details>
        {/if}
    </AppContent>
    <Toaster />
</AppShell>

{/if}
