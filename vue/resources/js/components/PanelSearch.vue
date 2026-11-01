<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3';
import { Search } from '@lucide/vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { NavigationLink } from '@/components/lavertia/types';

const page = usePage();
const open = ref(false);
const query = ref('');
const links = computed(() => (page.props.lavertiaSidebar ?? []) as NavigationLink[]);
const results = computed(() => {
    const needle = query.value.trim().toLocaleLowerCase();
    return links.value.filter(item => !needle
        || (item.label + ' ' + (item.group ?? '')).toLocaleLowerCase().includes(needle));
});
const onKeydown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        open.value = !open.value;
    }
};
onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => window.removeEventListener('keydown', onKeydown));
const close = () => { open.value = false; query.value = ''; };
</script>

<template>
    <Dialog v-model:open="open">
        <DialogTrigger as-child>
            <Button variant="ghost" size="icon" aria-label="Search panel pages" title="Search (⌘K)">
                <Search class="size-4" />
            </Button>
        </DialogTrigger>
        <DialogContent class="max-w-lg gap-3">
            <DialogTitle>Global search</DialogTitle>
            <DialogDescription>Find accessible pages in this panel.</DialogDescription>
            <input
                v-model="query"
                autofocus
                type="search"
                placeholder="Search pages..."
                aria-label="Search panel pages"
                class="h-11 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-2"
            />
            <div class="max-h-72 overflow-y-auto">
                <p v-if="results.length === 0" class="p-5 text-center text-sm text-muted-foreground">No matching pages.</p>
                <Link v-for="item in results" :key="item.slug" :href="item.url" @click="close"
                    class="flex min-h-10 items-center justify-between gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent">
                    <span class="font-medium">{{ item.label }}</span>
                    <span class="text-xs text-muted-foreground">{{ item.group }}</span>
                </Link>
            </div>
        </DialogContent>
    </Dialog>
</template>
