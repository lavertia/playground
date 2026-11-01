<script lang="ts">
    import { page, router } from '@inertiajs/svelte';
    import { localeLabel, localeUrl } from '@/components/lavertia/types';
    import type { PanelAppearance } from '@/components/lavertia/types';

    let panel = $derived(page.props.lavertiaPanel as PanelAppearance | null | undefined);

    function change(event: Event): void {
        const code = (event.target as HTMLSelectElement).value;
        router.visit(localeUrl(page.url, code), { preserveScroll: true });
    }
</script>

{#if panel?.languageSwitcher && (panel.supportedLocales?.length ?? 0) > 1}
    <label class="inline-flex items-center gap-2">
        <span class="sr-only">Language</span>
        <select aria-label="Language" value={panel.locale} onchange={change}
            class="h-9 min-w-24 max-w-44 rounded-md border border-border bg-background px-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            {#each panel.supportedLocales ?? [] as code (code)}
                <option value={code}>{localeLabel(code, panel.locale ?? 'en')}</option>
            {/each}
        </select>
    </label>
{/if}
