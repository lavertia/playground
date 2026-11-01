import { Link, router, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PanelNotification {
    id: string;
    title: string;
    message: string;
    url: string | null;
    read: boolean;
}

export function PanelNotifications() {
    const notifications = (usePage().props.lavertiaNotifications ?? []) as PanelNotification[];
    const unread = notifications.filter((notification) => !notification.read).length;

    const markRead = (id: string) => {
        router.post('/admin/notifications/' + encodeURIComponent(id) + '/read', {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" aria-label={`Notifications (${unread} unread)`} className="relative">
                    <Bell className="size-4" />
                    {unread > 0 && <span className="absolute -end-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">{unread > 9 ? '9+' : unread}</span>}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[min(22rem,calc(100vw-2rem))]">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 && (
                        <p className="p-5 text-center text-sm text-muted-foreground">No notifications yet.</p>
                    )}
                    {notifications.map((notification) => (
                        <div key={notification.id} className="flex items-start gap-2 border-b px-3 py-3 last:border-0">
                            <div className="min-w-0 flex-1">
                                <p className={`text-sm ${notification.read ? '' : 'font-semibold'}`}>{notification.title}</p>
                                {notification.message && <p className="mt-1 text-xs text-muted-foreground">{notification.message}</p>}
                                {notification.url && (
                                    <Link className="mt-1 block text-xs underline underline-offset-2" href={notification.url}>
                                        Open
                                    </Link>
                                )}
                            </div>
                            {!notification.read && (
                                <button type="button" onClick={() => markRead(notification.id)} className="shrink-0 rounded p-1 text-xs text-primary hover:underline focus-visible:outline-2" aria-label={`Mark ${notification.title} as read`}>
                                    Read
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
