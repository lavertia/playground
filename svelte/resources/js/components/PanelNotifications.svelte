<script lang="ts">
    import { Link, router, page } from '@inertiajs/svelte';
    import Bell from '@lucide/svelte/icons/bell';
    import {
        DropdownMenu,
        DropdownMenuContent,
        DropdownMenuLabel,
        DropdownMenuSeparator,
        DropdownMenuTrigger,
    } from '@/components/ui/dropdown-menu';

    interface NotificationItem {
        id: string;
        title: string;
        message: string;
        url: string | null;
        read: boolean;
    }

    let notifications = $derived((page.props.lavertiaNotifications ?? []) as NotificationItem[]);
    let unread = $derived(notifications.filter(item => !item.read).length);
    const read = (id: string) => {
        router.post('/admin/notifications/' + encodeURIComponent(id) + '/read', {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };
</script>

<DropdownMenu>
    <DropdownMenuTrigger asChild>
        {#snippet children(props)}
            <button type="button" onclick={props.onclick} aria-expanded={props['aria-expanded']}
                aria-label={`Notifications (${unread} unread)`}
                class="relative flex size-9 items-center justify-center rounded-md hover:bg-accent focus-visible:ring-2">
                <Bell class="size-4" />
                {#if unread > 0}
                    <span class="absolute -end-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">{unread > 9 ? '9+' : unread}</span>
                {/if}
            </button>
        {/snippet}
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-[min(22rem,calc(100vw-2rem))]">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div class="max-h-80 overflow-y-auto">
            {#if notifications.length === 0}
                <p class="p-5 text-center text-sm text-muted-foreground">No notifications yet.</p>
            {:else}
                {#each notifications as item (item.id)}
                    <div class="flex items-start gap-2 border-b px-3 py-3 last:border-0">
                        <div class="min-w-0 flex-1">
                            <p class={`text-sm ${!item.read ? 'font-semibold' : ''}`}>{item.title}</p>
                            {#if item.message}
                                <p class="mt-1 text-xs text-muted-foreground">{item.message}</p>
                            {/if}
                            {#if item.url}
                                <Link href={item.url} class="mt-1 block text-xs underline underline-offset-2">Open</Link>
                            {/if}
                        </div>
                        {#if !item.read}
                            <button type="button" onclick={() => read(item.id)}
                                class="shrink-0 rounded p-1 text-xs text-primary hover:underline"
                                aria-label={`Mark ${item.title} as read`}>Read</button>
                        {/if}
                    </div>
                {/each}
            {/if}
        </div>
    </DropdownMenuContent>
</DropdownMenu>
