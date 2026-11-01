<script lang="ts">
    import { page } from '@inertiajs/svelte';
    import type { PanelAppearance } from '@/components/lavertia/types';

    let panel = $derived(page.props.lavertiaPanel as PanelAppearance | null | undefined);
    let brandName = $derived(panel?.brandName ?? 'Lavertia');
    let subtitle = $derived(panel?.brandSubtitle ?? 'Playground');
</script>

<div class="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg text-base font-black shadow-sm ring-1 ring-black/10"
    style:background-color={panel?.primaryColor ?? '#f59e0b'}
    style:color={panel?.primaryForeground ?? '#111827'}>
    {#if panel?.brandLogo}
        <img src={panel.brandLogo} alt="" class="size-full object-contain" />
    {:else}
        {brandName.charAt(0).toLocaleUpperCase()}
    {/if}
</div>
<div class="ms-1 grid min-w-0 flex-1 text-start">
    <span class="truncate text-sm font-bold leading-tight">{brandName}</span>
    {#if subtitle}
        <span class="truncate text-[10px] font-medium text-muted-foreground">{subtitle}</span>
    {/if}
</div>
