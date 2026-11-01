import { Link, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { NavigationLink } from '@/components/lavertia/types';

export function PanelSearch() {
    const { props } = usePage();
    const links = (props.lavertiaSidebar ?? []) as NavigationLink[];
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setOpen((wasOpen) => !wasOpen);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    const results = useMemo(() => {
        const text = query.trim().toLocaleLowerCase();
        return links.filter((link) =>
            !text || (link.label + ' ' + (link.group ?? '')).toLocaleLowerCase().includes(text),
        );
    }, [links, query]);

    return (
        <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setQuery(''); }}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Search panel pages" title="Search (⌘K)">
                    <Search className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg gap-3 p-4 sm:p-5">
                <DialogHeader>
                    <DialogTitle>Global search</DialogTitle>
                    <DialogDescription>Find pages in this panel. Search is limited to accessible navigation pages.</DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2 rounded-md border px-3">
                    <Search aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                    <input
                        autoFocus
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search pages..."
                        aria-label="Search panel pages"
                        className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"
                    />
                </div>
                <div className="max-h-72 overflow-y-auto" aria-label="Matching pages">
                    {results.length === 0 ? (
                        <p className="px-3 py-8 text-center text-sm text-muted-foreground">No matching pages.</p>
                    ) : results.map((link) => (
                        <Link
                            key={link.slug}
                            href={link.url}
                            onClick={() => setOpen(false)}
                            className="flex min-h-10 items-center justify-between gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
                        >
                            <span className="font-medium">{link.label}</span>
                            <span className="truncate text-xs text-muted-foreground">{link.group}</span>
                        </Link>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
