<script lang="ts">
    import { page } from '@inertiajs/svelte';
    import type { Snippet } from 'svelte';
    import { SidebarProvider } from '@/components/ui/sidebar';
    import type { AppVariant } from '@/types';
    import type { PanelAppearance } from '@/components/lavertia/types';

    let {
        variant = 'sidebar',
        class: className = '',
        children,
    }: {
        variant?: AppVariant;
        class?: string;
        children?: Snippet;
    } = $props();

    const isOpen = $derived(page.props.sidebarOpen);
</script>

{#if variant === 'header'}
    <div class="flex min-h-screen w-full flex-col {className}">
        {@render children?.()}
    </div>
{:else}
    <SidebarProvider defaultOpen={isOpen} dir={page.props.lavertiaSidebarDirection === 'rtl' ? 'rtl' : 'ltr'}
        panelWidth={panel?.sidebarWidth ?? '18rem'}
        panelRadius={radii[panel?.borderRadius ?? 'md']}
        panelFont={panel?.fontFamily ?? 'inherit'}
        themeMode={panel?.themeMode ?? 'system'}>
        {@render children?.()}
    </SidebarProvider>
{/if}
