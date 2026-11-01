<script setup lang="ts">
import { usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import type { PanelAppearance } from '@/components/lavertia/types';

const page = usePage();
const panel = computed(() => page.props.lavertiaPanel as PanelAppearance | null | undefined);
const brandName = computed(() => panel.value?.brandName ?? 'Lavertia');
const subtitle = computed(() => panel.value?.brandSubtitle ?? 'Playground');
</script>

<template>
    <div
        class="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg text-base font-black text-gray-950 shadow-sm ring-1 ring-black/10"
        :style="{ backgroundColor: panel?.primaryColor ?? '#f59e0b' }"
    >
        <img v-if="panel?.brandLogo" :src="panel.brandLogo" alt="" class="size-full object-contain" />
        <template v-else>{{ brandName.charAt(0).toLocaleUpperCase() }}</template>
    </div>
    <div class="ms-1 grid min-w-0 flex-1 text-start">
        <span class="truncate text-sm font-bold leading-tight">{{ brandName }}</span>
        <span v-if="subtitle" class="truncate text-[10px] font-medium text-muted-foreground">{{ subtitle }}</span>
    </div>
</template>
