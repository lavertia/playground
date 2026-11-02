<script setup lang="ts">
import { computed } from 'vue';
import { Head } from '@inertiajs/vue3';
import LavertiaRenderer from '../../components/lavertia/renderer.vue';
import type { LavertiaPayload } from '../../components/lavertia/types';

const props = defineProps<{ lavertia: LavertiaPayload }>();
const maxWidths: Record<string, string> = {
    sm: '24rem', md: '32rem', lg: '48rem', xl: '64rem', '2xl': '80rem', full: '100%',
};
const variant = computed(() => props.lavertia.presentation?.variant ?? 'default');
const maxWidth = computed(() => maxWidths[props.lavertia.presentation?.maxWidth ?? 'full'] ?? '100%');
const cardPadding = computed(() => props.lavertia.presentation?.padding === 'compact' ? 'p-4 sm:p-5'
    : props.lavertia.presentation?.padding === 'spacious' ? 'p-8 sm:p-10' : 'p-6 sm:p-8');
const gridColumns = computed(() => props.lavertia.presentation?.ratio === 'start-wide'
    ? 'lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'
    : props.lavertia.presentation?.ratio === 'end-wide'
        ? 'lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]' : 'lg:grid-cols-2');
</script>

<template>
    <Head :title="lavertia.seo?.title ?? lavertia.title ?? 'Lavertia'">
        <meta v-if="lavertia.seo?.description" head-key="description" name="description" :content="lavertia.seo.description" />
        <meta v-if="lavertia.seo?.robots" head-key="robots" name="robots" :content="lavertia.seo.robots" />
        <link v-if="lavertia.seo?.canonical" head-key="canonical" rel="canonical" :href="lavertia.seo.canonical" />
    </Head>

    <main :lang="lavertia.locale" :dir="lavertia.direction"
        class="min-h-[calc(100vh-8rem)] bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
        <div v-if="lavertia.version === 1" class="mx-auto w-full max-w-[1440px]">
            <div v-if="variant === 'split' && lavertia.regions?.left && lavertia.regions?.right"
                class="grid w-full min-w-0 gap-6" :class="gridColumns">
                <section aria-label="Primary section" class="min-w-0">
                    <LavertiaRenderer :node="lavertia.regions.left" />
                </section>
                <section aria-label="Secondary section" class="min-w-0">
                    <LavertiaRenderer :node="lavertia.regions.right" />
                </section>
            </div>
            <div v-else-if="variant === 'card'" class="mx-auto w-full rounded-xl border border-border bg-card text-card-foreground shadow-sm"
                :class="cardPadding" :style="{ maxWidth }">
                <LavertiaRenderer :node="lavertia.tree" />
            </div>
            <div v-else-if="variant === 'flat'" class="mx-auto w-full min-w-0" :style="{ maxWidth }">
                <LavertiaRenderer :node="lavertia.tree" />
            </div>
            <LavertiaRenderer v-else :node="lavertia.tree" />
        </div>
        <p v-else role="alert" class="text-sm text-destructive">Unsupported Lavertia protocol version.</p>
    </main>
</template>
