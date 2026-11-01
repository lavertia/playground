<script setup lang="ts">
import { usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import AppLogoIcon from '@/components/AppLogoIcon.vue';
import type { PanelAppearance } from '@/components/lavertia/types';

const props = withDefaults(defineProps<{ compact?: boolean }>(), { compact: false });
const page = usePage();
const panel = computed(() => page.props.lavertiaPanel as PanelAppearance | null | undefined);
const name = computed(() => panel.value?.brandName ?? 'Lavertia');
const subtitle = computed(() => panel.value?.brandSubtitle ?? 'Playground');
const showText = computed(() => !props.compact && panel.value?.brandLogoDisplay !== 'icon');
</script>

<template>
    <template v-if="panel?.brandLogoDisplay !== 'hidden'">
        <div
            class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg shadow-sm ring-1 ring-black/5"
            :style="{
                backgroundColor: panel?.brandLogo ? 'transparent' : (panel?.primaryColor ?? '#f59e0b'),
                color: panel?.primaryForeground ?? '#111827',
            }"
        >
            <img v-if="panel?.brandLogo" :src="panel.brandLogo" :alt="name" class="size-full object-contain" />
            <AppLogoIcon v-else class-name="size-6" aria-hidden="true" />
        </div>
        <div v-if="showText" class="ms-2 grid min-w-0 flex-1 text-start group-data-[collapsible=icon]:hidden">
            <span class="truncate text-sm font-semibold leading-tight">{{ name }}</span>
            <span v-if="subtitle" class="truncate text-xs text-muted-foreground">{{ subtitle }}</span>
        </div>
    </template>
</template>
