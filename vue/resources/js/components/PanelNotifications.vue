<script setup lang="ts">
import { Link, router, usePage } from '@inertiajs/vue3';
import { Bell } from '@lucide/vue';
import { computed } from 'vue';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface PanelNotification {
    id: string;
    title: string;
    message: string;
    url: string | null;
    read: boolean;
}

const page = usePage();
const notifications = computed(() => (page.props.lavertiaNotifications ?? []) as PanelNotification[]);
const unread = computed(() => notifications.value.filter(item => !item.read).length);
const markRead = (id: string) => router.post('/admin/notifications/' + encodeURIComponent(id) + '/read', {}, {
    preserveScroll: true,
    preserveState: true,
});
</script>

<template>
    <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="relative" :aria-label="`Notifications (${unread} unread)`">
                <Bell class="size-4" />
                <span v-if="unread > 0" class="absolute -end-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">{{ unread > 9 ? '9+' : unread }}</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-[min(22rem,calc(100vw-2rem))]">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div class="max-h-80 overflow-y-auto">
                <p v-if="notifications.length === 0" class="p-5 text-center text-sm text-muted-foreground">No notifications yet.</p>
                <div v-for="item in notifications" :key="item.id" class="flex items-start gap-2 border-b px-3 py-3 last:border-0">
                    <div class="min-w-0 flex-1">
                        <p class="text-sm" :class="{ 'font-semibold': !item.read }">{{ item.title }}</p>
                        <p v-if="item.message" class="mt-1 text-xs text-muted-foreground">{{ item.message }}</p>
                        <Link v-if="item.url" :href="item.url" class="mt-1 block text-xs underline underline-offset-2">Open</Link>
                    </div>
                    <button v-if="!item.read" type="button" class="shrink-0 rounded p-1 text-xs text-primary hover:underline" :aria-label="`Mark ${item.title} as read`" @click="markRead(item.id)">Read</button>
                </div>
            </div>
        </DropdownMenuContent>
    </DropdownMenu>
</template>
