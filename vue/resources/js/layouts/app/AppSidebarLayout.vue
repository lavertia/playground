<script setup lang="ts">
import { usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import type { PanelAppearance } from '@/components/lavertia/types';
import AppContent from '@/components/AppContent.vue';
import AppShell from '@/components/AppShell.vue';
import AppSidebar from '@/components/AppSidebar.vue';
import AppSidebarHeader from '@/components/AppSidebarHeader.vue';
import PanelLocaleSwitcher from '@/components/PanelLocaleSwitcher.vue';
import { Toaster } from '@/components/ui/sonner';
import type { BreadcrumbItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

withDefaults(defineProps<Props>(), {
    breadcrumbs: () => [],
});

const page = usePage();
const maxWidths: Record<string, string> = { sm: '40rem', md: '48rem', lg: '64rem', xl: '80rem', '2xl': '96rem', full: 'none' };
const panel = computed(() => page.props.lavertiaPanel as PanelAppearance | null | undefined);
const contentMaxWidth = computed(() => {
    return maxWidths[panel.value?.contentWidth ?? 'full'];
});
</script>

<template>
    <div v-if="panel?.layout === 'full'" class="relative min-h-screen w-full" data-panel-layout="full">
        <div v-if="panel.languageSwitcher" class="absolute end-4 top-4 z-20"><PanelLocaleSwitcher /></div>
        <slot />
        <Toaster />
    </div>
    <AppShell v-else-if="panel?.layout === 'top'" variant="header">
        <AppSidebarHeader :breadcrumbs="breadcrumbs" :show-sidebar-trigger="false" />
        <AppContent variant="header" class="min-w-0 w-full max-w-none overflow-x-clip">
            <div class="mx-auto w-full min-w-0 flex-1" :style="{ maxWidth: contentMaxWidth }"><slot /></div>
        </AppContent>
        <Toaster />
    </AppShell>
    <AppShell v-else variant="sidebar">
        <AppSidebar />
        <AppContent variant="sidebar" class="min-w-0 overflow-x-clip">
            <AppSidebarHeader :breadcrumbs="breadcrumbs" />
            <div class="mx-auto w-full min-w-0 flex-1" :style="{ maxWidth: contentMaxWidth }">
                <slot />
            </div>
        </AppContent>
        <Toaster />
    </AppShell>
</template>
