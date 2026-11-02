<script lang="ts">
    import LavertiaRenderer from '../../components/lavertia/renderer.svelte';
    import type { LavertiaPayload } from '../../components/lavertia/types';

    let { lavertia }: { lavertia: LavertiaPayload } = $props();
    const maxWidths: Record<string, string> = {
        sm: '24rem', md: '32rem', lg: '48rem', xl: '64rem', '2xl': '80rem', full: '100%',
    };
    let variant = $derived(lavertia.presentation?.variant ?? 'default');
    let maxWidth = $derived(maxWidths[lavertia.presentation?.maxWidth ?? 'full'] ?? '100%');
    let cardPadding = $derived(lavertia.presentation?.padding === 'compact' ? 'p-4 sm:p-5'
        : lavertia.presentation?.padding === 'spacious' ? 'p-8 sm:p-10' : 'p-6 sm:p-8');
    let gridColumns = $derived(lavertia.presentation?.ratio === 'start-wide'
        ? 'lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'
        : lavertia.presentation?.ratio === 'end-wide'
            ? 'lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]' : 'lg:grid-cols-2');
</script>

<svelte:head>
    <title>{lavertia.seo?.title ?? lavertia.title ?? 'Lavertia'}</title>
    {#if lavertia.seo?.description}
        <meta name="description" content={lavertia.seo.description} />
    {/if}
    {#if lavertia.seo?.robots}
        <meta name="robots" content={lavertia.seo.robots} />
    {/if}
    {#if lavertia.seo?.canonical}
        <link rel="canonical" href={lavertia.seo.canonical} />
    {/if}
</svelte:head>

<main lang={lavertia.locale} dir={lavertia.direction}
    class="min-h-[calc(100vh-8rem)] bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-[1440px]">
        {#if lavertia.version === 1}
            {#if variant === 'split' && lavertia.regions?.left && lavertia.regions?.right}
                <div class="grid w-full min-w-0 gap-6 {gridColumns}">
                    <section aria-label="Primary section" class="min-w-0">
                        <LavertiaRenderer node={lavertia.regions.left} />
                    </section>
                    <section aria-label="Secondary section" class="min-w-0">
                        <LavertiaRenderer node={lavertia.regions.right} />
                    </section>
                </div>
            {:else if variant === 'card'}
                <div class="mx-auto w-full rounded-xl border border-border bg-card text-card-foreground shadow-sm {cardPadding}" style:max-width={maxWidth}>
                    <LavertiaRenderer node={lavertia.tree} />
                </div>
            {:else if variant === 'flat'}
                <div class="mx-auto w-full min-w-0" style:max-width={maxWidth}>
                    <LavertiaRenderer node={lavertia.tree} />
                </div>
            {:else}
                <LavertiaRenderer node={lavertia.tree} />
            {/if}
        {:else}
            <p role="alert" class="text-sm text-destructive">Unsupported Lavertia protocol version.</p>
        {/if}
    </div>
</main>
