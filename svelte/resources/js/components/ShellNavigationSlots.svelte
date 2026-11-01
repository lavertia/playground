<script lang="ts">
    import { page } from '@inertiajs/svelte';
    import LavertiaRenderer from '@/components/lavertia/renderer.svelte';
    import { shellNavigationSlots } from '@/components/lavertia/types';
    import type { PanelAppearance } from '@/components/lavertia/types';

    let { position }: { position: string } = $props();
    let nodes = $derived(shellNavigationSlots(
        page.props.lavertiaPanel as PanelAppearance | null | undefined, position,
    ));
</script>

{#if nodes.length}
    <div class="flex min-w-0 flex-col gap-2" data-lavertia-position={position}>
        {#each nodes as node (node.key)}
            <LavertiaRenderer {node} />
        {/each}
    </div>
{/if}
