<script lang="ts">
    import type { Snippet } from 'svelte';
    import { page } from '@inertiajs/svelte';
    import type { PanelAppearance } from '@/components/lavertia/types';
    import AppContent from '@/components/AppContent.svelte';
    import AppShell from '@/components/AppShell.svelte';
    import AppSidebar from '@/components/AppSidebar.svelte';
    import AppSidebarHeader from '@/components/AppSidebarHeader.svelte';
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
</script>

<AppShell variant="sidebar">
    <AppSidebar />
    <AppContent variant="sidebar" class="min-w-0 overflow-x-clip">
        <AppSidebarHeader {breadcrumbs} />
        <main class="mx-auto w-full min-w-0 flex-1" style:max-width={maxWidth}>
            {@render children?.()}
        </main>
    </AppContent>
    <Toaster />
</AppShell>
