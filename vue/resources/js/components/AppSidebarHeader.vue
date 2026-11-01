<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { NavigationLink, PanelAppearance } from '@/components/lavertia/types';
import type { BreadcrumbItem } from '@/types';

const props = withDefaults(
    defineProps<{ breadcrumbs?: BreadcrumbItem[] }>(),
    { breadcrumbs: () => [] },
);

const page = usePage();
const panel = computed(() => page.props.lavertiaPanel as PanelAppearance | null | undefined);
const links = computed(() => (page.props.lavertiaSidebar ?? []) as NavigationLink[]);
const resolvedBreadcrumbs = computed(() => {
    if (props.breadcrumbs.length > 0) return props.breadcrumbs;
    const active = links.value.find((item) => item.active);
    return active ? [{ title: active.label, href: active.url }] : [];
});
</script>

<template>
    <header
        class="flex min-h-14 shrink-0 flex-wrap items-center gap-3 border-b border-sidebar-border/70 px-4 py-2 md:px-6"
        :class="{ 'sticky top-0 z-30 bg-background/95 backdrop-blur': panel?.stickyHeader }"
    >
        <div class="flex min-w-0 items-center gap-2">
            <SidebarTrigger class="-ms-1" aria-label="Toggle navigation" />
            <Breadcrumbs
                v-if="panel?.breadcrumbs !== false && panel?.topbar !== false"
                :breadcrumbs="resolvedBreadcrumbs"
            />
        </div>
        <nav
            v-if="panel?.navigationPosition === 'top' && panel?.topbar !== false"
            aria-label="Panel navigation"
            class="ms-auto hidden min-w-0 flex-wrap items-center gap-1 md:flex"
        >
            <Link
                v-for="item in links"
                :key="item.slug"
                :href="item.url"
                :aria-current="item.active ? 'page' : undefined"
                class="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                :class="item.active ? 'bg-accent font-semibold text-accent-foreground' : 'text-muted-foreground'"
            >{{ item.label }}</Link>
        </nav>
    </header>
</template>
