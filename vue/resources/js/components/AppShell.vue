<script setup lang="ts">
import { usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import { themeVariables } from '@/components/lavertia/types';
import type { PanelAppearance } from '@/components/lavertia/types';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { AppVariant } from '@/types';

type Props = {
    variant?: AppVariant;
};

withDefaults(defineProps<Props>(), {
    variant: 'sidebar',
});

const page = usePage();
const panel = computed(() => page.props.lavertiaPanel as PanelAppearance | null | undefined);
const radii: Record<string, string> = { none: '0rem', sm: '0.25rem', md: '0.5rem', lg: '0.75rem', xl: '1rem' };
const isOpen = page.props.sidebarOpen;
const direction = computed(() => page.props.lavertiaSidebarDirection === 'rtl' ? 'rtl' : 'ltr');
</script>

<template>
    <div v-if="variant === 'header'" class="flex min-h-screen w-full flex-col"
        :data-lavertia-theme="panel?.theme?.id ?? 'default'" :style="themeVariables(panel)">
        <slot />
    </div>
    <SidebarProvider v-else :default-open="isOpen" :dir="direction"
        :data-lavertia-theme="panel?.theme?.id ?? 'default'"
        :style="themeVariables(panel)"
        :panel-width="panel?.sidebarWidth ?? '18rem'"
        :panel-radius="radii[panel?.borderRadius ?? 'md']"
        :panel-font="panel?.fontFamily ?? 'inherit'"
        :data-panel-theme="panel?.themeMode ?? 'system'">
        <slot />
    </SidebarProvider>
</template>
