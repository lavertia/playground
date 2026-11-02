import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import {
    BookOpenText, Check, CheckCircle2, ChevronRight, Clipboard, Code2,
    Database, ExternalLink, FlaskConical, Info, Layers3, LoaderCircle,
    Play, RefreshCw, Search, ShieldAlert,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ComponentNode } from './types';
import { LavertiaTable } from './lavertia-table';

type FeatureStatus = 'native' | 'partial' | 'demo' | 'guide';
interface FeatureDefinition {
    id: number;
    title: string;
    group: string;
    status: FeatureStatus;
    description: string;
    exercise: string;
    snippet: string;
}
interface Detail {
    title: string;
    slug: string;
    status: string;
    author: string | null;
}
type Props = {
    active: number;
    catalog: FeatureDefinition[];
    databaseReady: boolean;
    selectedRecord: Detail | null;
    demoOnly: true;
    locale: string;
};

const statusLabel: Record<FeatureStatus, string> = {
    native: 'Native PHP',
    partial: 'Partial',
    demo: 'UI preview',
    guide: 'Integration guide',
};
const statusColor: Record<FeatureStatus, string> = {
    native: 'text-emerald-700 bg-emerald-500/10 ring-emerald-500/20 dark:text-emerald-300',
    partial: 'text-amber-700 bg-amber-500/10 ring-amber-500/20 dark:text-amber-300',
    demo: 'text-blue-700 bg-blue-500/10 ring-blue-500/20 dark:text-blue-300',
    guide: 'text-muted-foreground bg-muted ring-border',
};

function LoadingRows() {
    return <div aria-label="Loading table preview" role="status"
        className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="space-y-2 border-b border-border p-5">
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="h-3 w-64 max-w-full animate-pulse rounded bg-muted" />
        </div>
        <div className="flex justify-end border-b border-border p-4">
            <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
        </div>
        {Array.from({ length: 6 }, (_, index) =>
            <div key={index} className="grid grid-cols-[40px_2fr_1fr_1fr] gap-5 border-b border-border/70 p-4" aria-hidden="true">
                <div className="size-6 animate-pulse rounded bg-muted" />
                <div className="h-5 animate-pulse rounded bg-muted" />
                <div className="h-5 animate-pulse rounded bg-muted" />
                <div className="h-5 animate-pulse rounded bg-muted" />
            </div>)}
    </div>;
}

export default function TablesFeatureLab({ node }: { node: ComponentNode }) {
    const props = node.props as unknown as Props;
    const catalog = Array.isArray(props.catalog) ? props.catalog : [];
    const active = catalog.find(feature => feature.id === props.active) ?? catalog[0];
    const [filter, setFilter] = useState('');
    const [view, setView] = useState<'preview' | 'code'>('preview');
    const [working, setWorking] = useState(false);
    const [copied, setCopied] = useState(false);
    const [loadingDemo, setLoadingDemo] = useState(false);
    const [navigationCount, setNavigationCount] = useState(0);

    const matching = useMemo(() => catalog.filter(feature =>
        [feature.title, feature.group, feature.description, String(feature.id)]
            .some(text => text.toLocaleLowerCase().includes(filter.trim().toLocaleLowerCase())),
    ), [catalog, filter]);
    const grouped = useMemo(() => {
        const result = new Map<string, FeatureDefinition[]>();
        for (const feature of matching) {
            result.set(feature.group, [...(result.get(feature.group) ?? []), feature]);
        }
        return [...result.entries()];
    }, [matching]);
    const nativeCount = catalog.filter(feature => feature.status === 'native').length;
    const currentTable = node.components.find(component => component.type === 'table');
    const isVisualLoading = active && [21, 22].includes(active.id);
    const needsRows = !!active && [2, 3, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 19, 20, 23, 24, 25, 26, 27].includes(active.id);

    useEffect(() => {
        setView('preview');
        setCopied(false);
        setWorking(false);
        if (!isVisualLoading) {
            setLoadingDemo(false);
            return;
        }
        setLoadingDemo(true);
        const timeout = window.setTimeout(() => setLoadingDemo(false), 850);
        return () => window.clearTimeout(timeout);
    }, [active?.id, isVisualLoading]);

    function selectFeature(id: number) {
        if (id === active?.id) return;
        setWorking(true);
        const url = new URL(window.location.href);
        url.searchParams.set('feature', String(id));
        url.searchParams.delete('record');

        for (const key of [...url.searchParams.keys()]) {
            if (key.startsWith('lvt_feature-explorer_')) {
                url.searchParams.delete(key);
            }
        }
        router.get(url.pathname + url.search, {}, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
            onFinish: () => setWorking(false),
        });
    }
    function replayLoading() {
        setLoadingDemo(true);
        const task = window.setTimeout(() => setLoadingDemo(false), 1500);
        setNavigationCount(old => old + 1);
        return () => window.clearTimeout(task);
    }
    async function copyCode() {
        if (!active) return;
        try {
            await navigator.clipboard.writeText(active.snippet);
            setCopied(true);
        } catch {
            setCopied(false);
        }
    }
    if (!active) {
        return <p role="alert" className="rounded-xl border border-destructive/40 p-6">No table experiments were provided.</p>;
    }

    const tableNode = currentTable ? {
        ...currentTable,
        props: {
            ...currentTable.props,
            demoReorder: [16, 17, 18].includes(active.id),
            demoReorderLabel: active.id === 17 ? 'Arrange posts' : 'Enable reordering',
        },
    } : null;

    return <section aria-label="Tables feature laboratory" className="space-y-5" data-table-feature-lab>
        <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground">Filament concepts</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{catalog.length}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground">Native PHP experiments</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{nativeCount}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground">Data provider</p>
                <p className="mt-1 flex items-center gap-2 text-base font-semibold">
                    <Database className="size-4 text-primary" />
                    {props.databaseReady ? 'Team-scoped Eloquent available' : 'Snapshot fixtures (seed to enable Eloquent)'}
                </p>
            </div>
        </div>

        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(225px,290px)_minmax(0,1fr)]">
            <aside className="min-w-0 self-start rounded-2xl border border-border bg-card lg:sticky lg:top-4">
                <div className="border-b border-border p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                        <Layers3 className="size-4 text-primary" />
                        Table experiments
                    </div>
                    <label className="relative block">
                        <span className="sr-only">Find a table experiment</span>
                        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input type="search" className="h-10 w-full rounded-lg border border-input bg-background ps-9 pe-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="Search 28 features..." value={filter} onChange={event => setFilter(event.target.value)} />
                    </label>
                </div>
                <nav aria-label="Choose table feature" className="max-h-[min(70vh,740px)] space-y-4 overflow-y-auto p-2">
                    {grouped.map(([name, features]) => <div key={name}>
                        <p className="px-2 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{name}</p>
                        <div className="space-y-0.5">
                            {features.map(feature => <button type="button" key={feature.id}
                                data-feature={feature.id}
                                aria-current={active.id === feature.id ? 'step' : undefined}
                                onClick={() => selectFeature(feature.id)}
                                disabled={working}
                                className={cn('flex w-full items-start gap-2 rounded-lg px-2.5 py-2.5 text-start text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50', active.id === feature.id && 'bg-primary/10 text-foreground ring-1 ring-primary/20')}>
                                <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold tabular-nums', active.id === feature.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>{feature.id}</span>
                                <span className="min-w-0 flex-1 leading-5">{feature.title}</span>
                                {feature.status === 'native'
                                    ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-label="Native" />
                                    : <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground rtl:rotate-180" aria-hidden="true" />}
                            </button>)}
                        </div>
                    </div>)}
                    {matching.length === 0 && <p className="px-3 py-8 text-center text-sm text-muted-foreground">No experiments match your search.</p>}
                </nav>
            </aside>

            <div className="min-w-0 space-y-4" aria-live="polite">
                <header className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Experiment {active.id} / {catalog.length}
                        </span>
                        <span className={cn('inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset', statusColor[active.status])}>
                            {statusLabel[active.status]}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{active.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{active.description}</p>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border border-primary/15 bg-primary/5 p-3 text-sm">
                        <Play className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                        <div><strong>Try it:</strong> {active.exercise}</div>
                    </div>
                    {needsRows && !props.databaseReady &&
                        <div role="note" className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                            Real SQL mode requires demo posts. This preview currently uses bounded fictional snapshot rows.
                        </div>}
                </header>

                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div role="tablist" aria-label="Experiment view" className="inline-flex rounded-lg border border-border bg-card p-1">
                        <button type="button" role="tab" aria-selected={view === 'preview'} onClick={() => setView('preview')}
                            className={cn('rounded-md px-4 py-2 text-sm font-medium', view === 'preview' && 'bg-muted text-foreground shadow-sm')}>Live preview</button>
                        <button type="button" role="tab" aria-selected={view === 'code'} onClick={() => setView('code')}
                            className={cn('rounded-md px-4 py-2 text-sm font-medium', view === 'code' && 'bg-muted text-foreground shadow-sm')}>PHP source</button>
                    </div>
                    <a target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                        href="https://filamentphp.com/docs/5.x/tables/overview"><BookOpenText className="size-4" />Filament reference<ExternalLink className="size-3" /></a>
                </div>

                {view === 'preview' ? <>
                    {isVisualLoading && <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-4 text-sm">
                        <div className="flex items-center gap-2"><FlaskConical className="size-4 text-primary" />
                            Skeleton / loading animation preview only
                        </div>
                        <button type="button" onClick={replayLoading}
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-input px-3 text-sm hover:bg-muted">
                            <RefreshCw className="size-4" />Replay loading
                        </button>
                    </div>}
                    {loadingDemo ? <LoadingRows key={navigationCount} /> : tableNode ? <LavertiaTable key={active.id} node={tableNode} /> : null}
                    {active.id === 15 && props.selectedRecord && <div role="status" className="space-y-1 rounded-xl border border-primary/30 bg-card p-4">
                        <strong className="text-sm">Team-authorized record selected</strong>
                        <p className="font-semibold">{props.selectedRecord.title}</p>
                        <p className="text-xs text-muted-foreground">{props.selectedRecord.slug} · {props.selectedRecord.status} · {props.selectedRecord.author}</p>
                    </div>}
                    {active.id === 23 && <div className="rounded-xl border border-dashed border-border p-4 text-sm">
                        <strong>Scout integration not installed</strong>
                        <p className="mt-1 text-muted-foreground">Try the SQL search in the table. Scout requires a separately configured search driver, authorization, and tenant-scoped key lookup.</p>
                    </div>}
                    {active.id === 28 && <div className="rounded-xl border border-border bg-card p-4 text-sm">
                        <strong>Shared application defaults</strong>
                        <p className="mt-1 text-muted-foreground">Pagination options 5 / 10 / 25 / 50, searchable, column picker. Global static callbacks are not part of this implementation.</p>
                    </div>}
                </> : <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <div className="inline-flex items-center gap-2 text-sm font-semibold"><Code2 className="size-4" />Lavertia PHP example</div>
                        <button type="button" onClick={() => void copyCode()} className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-xs hover:bg-muted">
                            {copied ? <Check className="size-3.5" /> : <Clipboard className="size-3.5" />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                    <pre className="overflow-x-auto bg-muted/20 p-5 text-xs leading-6 sm:text-sm"><code>{active.snippet}</code></pre>
                    <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
                        {active.status === 'native' ? 'Executable Lavertia API in this branch.'
                            : active.status === 'partial' ? 'Partially implemented; see the explanation above.'
                                : active.status === 'demo' ? 'Conceptual preview; code is not a production persistence API.'
                                    : 'Integration guidance only; the optional package is not installed.'}
                    </p>
                </div>}

                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Info className="size-4 shrink-0" />
                    <span>No database mutations are performed by this laboratory. Eloquent reads are scoped to your team.</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                    <button type="button" disabled={active.id <= 1 || working} onClick={() => selectFeature(active.id - 1)}
                        className="rounded-lg border border-input px-3 py-2 text-sm disabled:opacity-40 hover:bg-muted">Previous feature</button>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        {working ? <LoaderCircle className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                        {working ? 'Loading' : 'Ready'}
                    </span>
                    <button type="button" disabled={active.id >= catalog.length || working} onClick={() => selectFeature(active.id + 1)}
                        className="rounded-lg border border-input px-3 py-2 text-sm disabled:opacity-40 hover:bg-muted">Next feature</button>
                </div>
            </div>
        </div>
    </section>;
}
