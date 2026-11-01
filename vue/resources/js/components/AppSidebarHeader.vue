<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import AppLogo from '@/components/AppLogo.vue';
import TeamSwitcher from '@/components/TeamSwitcher.vue';
import PanelSearch from '@/components/PanelSearch.vue';
import PanelNotifications from '@/components/PanelNotifications.vue';
import PanelLocaleSwitcher from '@/components/PanelLocaleSwitcher.vue';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { NavigationLink, PanelAppearance } from '@/components/lavertia/types';
import type { BreadcrumbItem } from '@/types';

const props = withDefaults(
    defineProps<{ breadcrumbs?: BreadcrumbItem[]; showSidebarTrigger?: boolean }>(),
    { breadcrumbs: () => [], showSidebarTrigger: true },
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
            <SidebarTrigger v-if="props.showSidebarTrigger" class="-ms-1" aria-label="Toggle navigation" />
            <Link v-if="panel?.brandLogoDisplay !== 'hidden' && (panel?.brandLogoPlacement === 'topbar' || panel?.brandLogoPlacement === 'both')"
                href="/admin/dashboard" class="flex items-center gap-2 rounded-md p-1 hover:bg-accent" :aria-label="panel?.brandName">
                <AppLogo compact />
            </Link>
            <Breadcrumbs
                v-if="panel?.breadcrumbs !== false && panel?.topbar !== false"
                :breadcrumbs="resolvedBreadcrumbs"
            />
        </div>
        <nav
            v-if="panel?.navigationPosition === 'top' && panel?.topbar !== false"
            aria-label="Panel navigation"
            class="order-3 flex w-full min-w-0 flex-wrap items-center gap-1 md:order-none md:ms-auto md:w-auto"
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
        <div v-if="panel?.topbar !== false" class="ms-auto flex shrink-0 items-center gap-1">
            <TeamSwitcher v-if="panel?.tenantSwitcher !== false && panel?.tenantSwitcherPlacement === 'topbar'" :in-header="true" />
            <PanelLocaleSwitcher />
            <PanelSearch v-if="panel?.globalSearch === true" />
            <PanelNotifications v-if="panel?.notifications === true" />
        </div>
    </header>
</template>
