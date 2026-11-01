<script setup lang="ts">
import { usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import LavertiaRenderer from '@/components/lavertia/renderer.vue';
import { shellNavigationSlots } from '@/components/lavertia/types';
import type { PanelAppearance } from '@/components/lavertia/types';

const props = defineProps<{ position: string }>();
const page = usePage();
const nodes = computed(() => shellNavigationSlots(
    page.props.lavertiaPanel as PanelAppearance | null | undefined, props.position,
));
</script>

<template>
    <div v-if="nodes.length" class="flex min-w-0 flex-col gap-2" :data-lavertia-position="position">
        <LavertiaRenderer v-for="node in nodes" :key="node.key" :node="node" />
    </div>
</template>
