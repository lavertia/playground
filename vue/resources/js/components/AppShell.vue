<script setup lang="ts">
import { usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { AppVariant } from '@/types';

type Props = {
    variant?: AppVariant;
};

withDefaults(defineProps<Props>(), {
    variant: 'sidebar',
});

const page = usePage();
const isOpen = page.props.sidebarOpen;
const direction = computed(() => page.props.lavertiaSidebarDirection === 'rtl' ? 'rtl' : 'ltr');
</script>

<template>
    <div v-if="variant === 'header'" class="flex min-h-screen w-full flex-col">
        <slot />
    </div>
    <SidebarProvider v-else :default-open="isOpen" :dir="direction">
        <slot />
    </SidebarProvider>
</template>
