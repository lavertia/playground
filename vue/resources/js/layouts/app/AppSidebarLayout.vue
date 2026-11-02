<script setup lang="ts">
import { usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import { shellNavigationSlots, themeVariables } from '@/components/lavertia/types';
import type { PanelAppearance } from '@/components/lavertia/types';
import AppContent from '@/components/AppContent.vue';
import AppShell from '@/components/AppShell.vue';
import AppSidebar from '@/components/AppSidebar.vue';
import AppSidebarHeader from '@/components/AppSidebarHeader.vue';
import PanelLocaleSwitcher from '@/components/PanelLocaleSwitcher.vue';
import ShellNavigationSlots from '@/components/ShellNavigationSlots.vue';
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
const hasContext = computed(() => panel.value?.layout === 'workspace' && shellNavigationSlots(panel.value, 'context').length > 0);
const contentMaxWidth = computed(() => {
    return maxWidths[panel.value?.contentWidth ?? 'full'];
});
</script>

<template>
    <div v-if="panel?.layout === 'full'" class="relative min-h-screen w-full" data-panel-layout="full" :data-lavertia-theme="panel?.theme?.id ?? 'default'" :style="themeVariables(panel)">
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
            <div class="flex min-w-0 flex-1">
                <div class="mx-auto w-full min-w-0 flex-1" :style="{ maxWidth: contentMaxWidth }">
                    <slot />
                </div>
                <aside v-if="hasContext" aria-label="Context navigation" class="hidden w-64 shrink-0 border-s border-border p-3 xl:block">
                    <ShellNavigationSlots position="context" />
                </aside>
            </div>
            <details v-if="hasContext" class="mx-4 mb-4 rounded-md border border-border p-3 xl:hidden">
                <summary class="cursor-pointer text-sm font-semibold">Context navigation</summary>
                <ShellNavigationSlots position="context" />
            </details>
        </AppContent>
        <Toaster />
    </AppShell>
</template>
