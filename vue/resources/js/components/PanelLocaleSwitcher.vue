<script setup lang="ts">
import { router, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import { localeLabel, localeUrl } from '@/components/lavertia/types';
import type { PanelAppearance } from '@/components/lavertia/types';

const page = usePage();
const panel = computed(() => page.props.lavertiaPanel as PanelAppearance | null | undefined);

function change(event: Event): void {
    const locale = (event.target as HTMLSelectElement).value;
    router.visit(localeUrl(page.url, locale), { preserveScroll: true });
}
</script>

<template>
    <label v-if="panel?.languageSwitcher && (panel?.supportedLocales?.length ?? 0) > 1" class="inline-flex items-center gap-2">
        <span class="sr-only">Language</span>
        <select aria-label="Language" :value="panel.locale" @change="change"
            class="h-9 min-w-24 max-w-44 rounded-md border border-border bg-background px-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            <option v-for="code in (panel.supportedLocales ?? [])" :key="code" :value="code">{{ localeLabel(code, panel.locale ?? 'en') }}</option>
        </select>
    </label>
</template>
