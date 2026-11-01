<script lang="ts">
    import { Link, router, page } from '@inertiajs/svelte';
    import LogOut from '@lucide/svelte/icons/log-out';
    import Settings from '@lucide/svelte/icons/settings';
    import {
        DropdownMenuGroup,
        DropdownMenuItem,
        DropdownMenuLabel,
        DropdownMenuSeparator,
    } from '@/components/ui/dropdown-menu';
    import UserInfo from '@/components/UserInfo.svelte';
    import { toUrl } from '@/lib/utils';
    import { logout } from '@/routes';
    import { edit } from '@/routes/profile';
    import type { User } from '@/types';
    import type { PanelAppearance } from '@/components/lavertia/types';

    let {
        user,
    }: {
        user: User;
    } = $props();

    let panel = $derived(page.props.lavertiaPanel as PanelAppearance | null | undefined);

    function handleLogout(propsOnClick?: () => void) {
        return () => {
            propsOnClick?.();
            router.flushAll();
        };
    }
</script>

<DropdownMenuLabel class="p-0 font-normal">
    <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
        <UserInfo {user} showEmail={true} />
    </div>
</DropdownMenuLabel>
<DropdownMenuSeparator />
{#if panel?.userMenuSettings !== false}
<DropdownMenuGroup>
    <DropdownMenuItem asChild>
        {#snippet children(props)}
            <Link
                class={props.class}
                href={toUrl(edit())}
                prefetch
                onclick={props.onClick}
            >
                <Settings class="mr-2 h-4 w-4" />
                Settings
            </Link>
        {/snippet}
    </DropdownMenuItem>
</DropdownMenuGroup>
{/if}
{#each panel?.userMenuLinks ?? [] as item (item.url)}
    <DropdownMenuItem asChild>
        {#snippet children(props)}
            {#if item.external}
                <a href={item.url} target="_blank" rel="noopener noreferrer" class={props.class}>{item.label}</a>
            {:else}
                <Link href={item.url} class={props.class}>{item.label}</Link>
            {/if}
        {/snippet}
    </DropdownMenuItem>
{/each}
{#if panel?.userMenuLogout !== false}
<DropdownMenuSeparator />
<DropdownMenuItem asChild>
    {#snippet children(props)}
        <Link
            class={props.class}
            href={logout()}
            as="button"
            onclick={handleLogout(props.onClick)}
            data-test="logout-button"
        >
            <LogOut class="mr-2 h-4 w-4" />
            Log out
        </Link>
    {/snippet}
</DropdownMenuItem>
{/if}
