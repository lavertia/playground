<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3';
import { BookOpen, FileText, FolderGit2, LayoutGrid } from '@lucide/vue';
import { computed } from 'vue';
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
import type { NavigationLink } from '@/components/lavertia/types';

const page = usePage();
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

const footerNavItems: NavItem[] = [
    {
        title: 'Source repository',
        href: 'https://github.com/lavertia/playground',
        icon: FolderGit2,
    },
    {
        title: 'Lavertia project',
        href: 'https://github.com/lavertia/lavertia',
        icon: BookOpen,
    },
];
</script>

<template>
    <Sidebar collapsible="icon" variant="inset" :side="page.props.lavertiaSidebarDirection === 'rtl' ? 'right' : 'left'">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" as-child>
                        <Link href="/admin/dashboard">
                            <AppLogo />
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenu>
                <SidebarMenuItem>
                    <TeamSwitcher />
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
            <NavMain :items="mainNavItems" />
            <SidebarGroup v-for="group in panelGroups" :key="group.label" class="px-2 py-0">
                <SidebarGroupLabel>{{ group.label }}</SidebarGroupLabel>
                <SidebarMenu>
                    <SidebarMenuItem v-for="item in group.items" :key="item.slug">
                        <SidebarMenuButton as-child :is-active="item.active" :tooltip="item.label">
                            <Link :href="item.url" :aria-current="item.active ? 'page' : undefined"
                                @click="isMobile && setOpenMobile(false)">
                                <LayoutGrid v-if="item.slug === 'dashboard'" class="size-4 shrink-0" />
                                <FileText v-else class="size-4 shrink-0" />
                                <span>{{ item.label }}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
            <NavFooter :items="footerNavItems" />
            <NavUser />
        </SidebarFooter>
    </Sidebar>
    <slot />
</template>
