<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3';
import {
    Bell, BookOpen, Briefcase, Calendar, ChartColumn, FileChartColumn, FileText,
    Folder, House, LayoutDashboard, LayoutGrid, Link2, List, Receipt, Settings,
    Shield, Users, Wallet,
} from '@lucide/vue';
import { computed } from 'vue';
import type { Component } from 'vue';
import AppLogo from '@/components/AppLogo.vue';
import NavFooter from '@/components/NavFooter.vue';
import NavMain from '@/components/NavMain.vue';
import NavUser from '@/components/NavUser.vue';
import TeamSwitcher from '@/components/TeamSwitcher.vue';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import type { NavigationLink, PanelAppearance } from '@/components/lavertia/types';

const navigationIcons: Record<string, Component> = {
    bell: Bell,
    'book-open': BookOpen,
    briefcase: Briefcase,
    calendar: Calendar,
    'chart-column': ChartColumn,
    'file-chart-column': FileChartColumn,
    'file-text': FileText,
    folder: Folder,
    house: House,
    'layout-dashboard': LayoutDashboard,
    list: List,
    receipt: Receipt,
    settings: Settings,
    shield: Shield,
    users: Users,
    wallet: Wallet,
};

const page = usePage();
const panel = computed(() => page.props.lavertiaPanel as PanelAppearance | null | undefined);
const { isMobile, setOpenMobile } = useSidebar();

const starterDashboard = computed(() =>
    page.props.currentTeam ? dashboard(page.props.currentTeam.slug).url : '/',
);

const panelLinks = computed(() => (page.props.lavertiaSidebar ?? []) as NavigationLink[]);

const mainNavItems = computed<NavItem[]>(() => [
    ...(!panelLinks.value.some((item) => item.slug === 'dashboard')
        ? [{ title: 'Lavertia overview', href: '/admin/dashboard', icon: LayoutGrid }]
        : []),
    {
        title: 'Starter dashboard',
        href: starterDashboard.value,
        icon: BookOpen,
    },
]);

const panelGroups = computed(() => {
    const links = panelLinks.value;
    const groups: Array<{ label: string; items: NavigationLink[] }> = [];

    for (const item of links) {
        const label = item.group || 'Lavertia';
        const group = groups.find((entry) => entry.label === label);
        if (group) group.items.push(item);
        else groups.push({ label, items: [item] });
    }

    return groups;
});

const footerNavItems = computed<NavItem[]>(() => (panel.value?.footerLinks ?? []).map((item) => ({
    title: item.label,
    href: item.url,
    icon: Link2,
})));
</script>

<template>
    <Sidebar
        :collapsible="panel?.sidebarCollapsible === false ? 'none' : 'icon'"
        :variant="panel?.sidebarVariant ?? 'inset'"
        :side="page.props.lavertiaSidebarDirection === 'rtl' ? 'right' : 'left'"
        :style="{ '--sidebar-primary': panel?.primaryColor ?? '#f59e0b', '--sidebar-width': panel?.sidebarWidth ?? '18rem' }"
    >
        <SidebarHeader>
            <SidebarMenu v-if="panel?.brandLogoDisplay !== 'hidden' && panel?.brandLogoPlacement !== 'topbar'">
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" as-child>
                        <Link href="/admin/dashboard">
                            <AppLogo />
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenu v-if="panel?.tenantSwitcher !== false && panel?.tenantSwitcherPlacement !== 'topbar'">
                <SidebarMenuItem>
                    <TeamSwitcher />
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
            <NavMain :items="mainNavItems" />
            <SidebarGroup v-for="group in ((panel?.navigationPosition !== 'top' || isMobile) && (panel?.mobileNavigation !== false || !isMobile) ? panelGroups : [])" :key="group.label" class="px-2 py-0">
                <SidebarGroupLabel>{{ group.label }}</SidebarGroupLabel>
                <SidebarMenu>
                    <SidebarMenuItem v-for="item in group.items" :key="item.slug">
                        <SidebarMenuButton as-child :is-active="item.active" :tooltip="item.label">
                            <Link :href="item.url" :aria-current="item.active ? 'page' : undefined"
                                @click="isMobile && setOpenMobile(false)">
                                <component :is="navigationIcons[item.icon ?? ''] ?? (item.slug === 'dashboard' ? LayoutGrid : FileText)" class="size-4 shrink-0" aria-hidden="true" />
                                <span class="truncate">{{ item.label }}</span>
                                <span v-if="item.badge" class="ms-auto shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">{{ item.badge }}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
            <NavFooter v-if="footerNavItems.length" :items="footerNavItems" />
            <NavUser />
        </SidebarFooter>
    </Sidebar>
    <slot />
</template>
