<script setup lang="ts">
import { Link, router, usePage } from '@inertiajs/vue3';
import { LogOut, Settings } from '@lucide/vue';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import UserInfo from '@/components/UserInfo.vue';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { User } from '@/types';
import type { PanelAppearance } from '@/components/lavertia/types';

type Props = {
    user: User;
};

const panel = usePage().props.lavertiaPanel as PanelAppearance | null | undefined;

const handleLogout = () => {
    router.flushAll();
};

defineProps<Props>();
</script>

<template>
    <DropdownMenuLabel class="p-0 font-normal">
        <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <UserInfo :user="user" :show-email="true" />
        </div>
    </DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuGroup v-if="panel?.userMenuSettings !== false">
        <DropdownMenuItem :as-child="true">
            <Link class="block w-full cursor-pointer" :href="edit()" prefetch>
                <Settings class="mr-2 h-4 w-4" />
                Settings
            </Link>
        </DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuItem v-for="item in panel?.userMenuLinks ?? []" :key="item.url" :as-child="true">
        <a v-if="item.external" :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.label }}</a>
        <Link v-else :href="item.url">{{ item.label }}</Link>
    </DropdownMenuItem>
    <DropdownMenuSeparator v-if="panel?.userMenuLogout !== false" />
    <DropdownMenuItem v-if="panel?.userMenuLogout !== false" :as-child="true">
        <Link
            class="block w-full cursor-pointer"
            :href="logout()"
            @click="handleLogout"
            as="button"
            data-test="logout-button"
        >
            <LogOut class="mr-2 h-4 w-4" />
            Log out
        </Link>
    </DropdownMenuItem>
</template>
