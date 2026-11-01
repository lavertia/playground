<script lang="ts">
    import { Link, page } from '@inertiajs/svelte';
    import Search from '@lucide/svelte/icons/search';
    import { onMount } from 'svelte';
    import { Dialog, DialogContent } from '@/components/ui/dialog';
    import type { NavigationLink } from '@/components/lavertia/types';

    let open = $state(false);
    let query = $state('');
    let links = $derived((page.props.lavertiaSidebar ?? []) as NavigationLink[]);
    let results = $derived(links.filter(item => {
        const needle = query.trim().toLocaleLowerCase();
        return !needle || (item.label + ' ' + (item.group ?? '')).toLocaleLowerCase().includes(needle);
    }));

    function close() {
        open = false;
        query = '';
    }

    onMount(() => {
        const handler = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                open = !open;
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    });
</script>

<button type="button" aria-label="Search panel pages" title="Search (⌘K)"
    class="inline-flex size-9 items-center justify-center rounded-md hover:bg-accent focus-visible:ring-2" onclick={() => open = true}>
    <Search class="size-4" />
</button>

<Dialog bind:open>
    <DialogContent class="max-w-lg">
        <h2 class="text-lg font-semibold">Global search</h2>
        <p class="text-xs text-muted-foreground">Find accessible pages in this panel.</p>
        <input
            type="search"
            bind:value={query}
            placeholder="Search pages..."
            aria-label="Search panel pages"
            class="mt-3 h-11 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-2"
        />
        <div class="mt-3 max-h-72 overflow-y-auto">
            {#if results.length === 0}
                <p class="p-5 text-center text-sm text-muted-foreground">No matching pages.</p>
            {:else}
                {#each results as item (item.slug)}
                    <Link href={item.url} onclick={close}
                        class="flex min-h-10 items-center justify-between gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent">
                        <span class="font-medium">{item.label}</span>
                        <span class="text-xs text-muted-foreground">{item.group}</span>
                    </Link>
                {/each}
            {/if}
        </div>
    </DialogContent>
</Dialog>
