<script lang="ts">
    import { page } from '@inertiajs/svelte';
    import AppLogoIcon from '@/components/AppLogoIcon.svelte';
    import type { PanelAppearance } from '@/components/lavertia/types';

    let { compact = false }: { compact?: boolean } = $props();
    let panel = $derived(page.props.lavertiaPanel as PanelAppearance | null | undefined);
    let brandName = $derived(panel?.brandName ?? 'Lavertia');
    let subtitle = $derived(panel?.brandSubtitle ?? 'Playground');
</script>

{#if panel?.brandLogoDisplay !== 'hidden'}
    <div class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg shadow-sm ring-1 ring-black/5"
        style:background-color={panel?.brandLogo ? 'transparent' : (panel?.primaryColor ?? '#f59e0b')}
        style:color={panel?.primaryForeground ?? '#111827'}>
        {#if panel?.brandLogo}
            <img src={panel.brandLogo} alt={brandName} class="size-full object-contain" />
        {:else}
            <AppLogoIcon class="size-6" aria-hidden="true" />
        {/if}
    </div>
    {#if !compact && panel?.brandLogoDisplay !== 'icon'}
        <div class="ms-2 grid min-w-0 flex-1 text-start group-data-[collapsible=icon]:hidden">
            <span class="truncate text-sm font-semibold leading-tight">{brandName}</span>
            {#if subtitle}
                <span class="truncate text-xs text-muted-foreground">{subtitle}</span>
            {/if}
        </div>
    {/if}
{/if}
