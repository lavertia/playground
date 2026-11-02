import { useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
    BarChart3, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight,
    ChevronsLeft, ChevronsRight, Columns3, Filter, MoreVertical, Package, Plus, Search,
    Trash2, Truck, XCircle,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { QueryBuilderEditor } from './query-builder-editor';
import { countRules, evaluateQuery, validateQuery } from './filter-query';
import type { FilterField, FilterGroup } from './filter-query';
import type { ComponentNode } from './types';
import { cn } from '@/lib/utils';

type Product = {
    id: number; name: string; slug: string; brand: string; price: number; compare_at_price: number;
    cost_per_item: number; quantity: number; security_stock: number; sku: string; barcode: string;
    description: string; visibility: boolean; featured: boolean; backorder: boolean;
    requires_shipping: boolean; published_at: string; thumbnail: number;
};
type Order = {
    id: number; number: string; customer: string; status: string;
    total_price: number; shipping_cost: number; order_date: string;
};
type RecordRow = Product | Order;
type Mode = 'products' | 'orders';
type RowAction = { kind: 'view' | 'delete' | 'create'; id?: number } | null;
type Column = { key: string; label: string; sortable?: boolean; defaultVisible?: boolean };
type FormValues = {
    name: string; brand: string; price: string; quantity: string;
    customer: string; status: string; total_price: string; shipping_cost: string;
};

const fieldsForProducts: FilterField[] = [
    { key: 'name', label: 'Name', kind: 'text' },
    { key: 'slug', label: 'Slug', kind: 'text' },
    { key: 'sku', label: 'SKU (Stock Keeping Unit)', kind: 'text' },
    { key: 'barcode', label: 'Barcode', kind: 'text' },
    { key: 'description', label: 'Description', kind: 'text' },
    { key: 'compare_at_price', label: 'Compare at price', kind: 'number' },
    { key: 'price', label: 'Price', kind: 'number' },
    { key: 'cost_per_item', label: 'Cost per item', kind: 'number' },
    { key: 'quantity', label: 'Quantity', kind: 'number' },
    { key: 'security_stock', label: 'Security stock', kind: 'number' },
    { key: 'visibility', label: 'Visibility', kind: 'boolean' },
    { key: 'featured', label: 'Featured', kind: 'boolean' },
    { key: 'backorder', label: 'Backorder', kind: 'boolean' },
    { key: 'requires_shipping', label: 'Requires shipping', kind: 'boolean' },
    { key: 'published_at', label: 'Publishing date', kind: 'date' },
    { key: 'brand', label: 'Brand', kind: 'text' },
];
const fieldsForOrders: FilterField[] = [
    { key: 'number', label: 'Number', kind: 'text' },
    { key: 'customer', label: 'Customer', kind: 'text' },
    { key: 'status', label: 'Status', kind: 'text' },
    { key: 'total_price', label: 'Total price', kind: 'number' },
    { key: 'shipping_cost', label: 'Shipping cost', kind: 'number' },
    { key: 'order_date', label: 'Order date', kind: 'date' },
];
const productColumns: Column[] = [
    { key: 'thumbnail', label: 'Image', defaultVisible: true },
    { key: 'name', label: 'Name', sortable: true, defaultVisible: true },
    { key: 'brand', label: 'Brand', sortable: true, defaultVisible: true },
    { key: 'visibility', label: 'Visibility', sortable: true, defaultVisible: true },
    { key: 'price', label: 'Price', sortable: true, defaultVisible: true },
    { key: 'sku', label: 'SKU', sortable: true, defaultVisible: true },
    { key: 'quantity', label: 'Quantity', sortable: true, defaultVisible: true },
    { key: 'security_stock', label: 'Security stock', sortable: true },
    { key: 'published_at', label: 'Publishing date', sortable: true },
];
const orderColumns: Column[] = [
    { key: 'number', label: 'Number', sortable: true, defaultVisible: true },
    { key: 'customer', label: 'Customer', sortable: true, defaultVisible: true },
    { key: 'status', label: 'Status', sortable: true, defaultVisible: true },
    { key: 'total_price', label: 'Total price', sortable: true, defaultVisible: true },
    { key: 'shipping_cost', label: 'Shipping cost', sortable: true, defaultVisible: true },
    { key: 'order_date', label: 'Order date', sortable: true, defaultVisible: true },
];
const statuses = ['all', 'new', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
const emptyGroup = (): FilterGroup => ({ type: 'group', id: 'root', junction: 'and', children: [] });
const defaultColumns = (mode: Mode) =>
    (mode === 'products' ? productColumns : orderColumns).filter(c => c.defaultVisible).map(c => c.key);
const emptyForm: FormValues = {
    name: '', brand: '', price: '99.00', quantity: '1', customer: '',
    status: 'new', total_price: '125.00', shipping_cost: '10.00',
};
const money = (n: number): string => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
}).format(n);
const button = 'inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-40';
const iconButton = 'inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring';
const input = 'h-9 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40';

function valueOf(row: RecordRow, key: string): string | number | boolean | undefined {
    return (row as unknown as Record<string, string | number | boolean | undefined>)[key];
}
function sum(rows: readonly RecordRow[], key: string): number {
    return rows.reduce((total, row) => total + Number(valueOf(row, key) ?? 0), 0);
}
function StatusBadge({ status }: { status: string }) {
    const isGood = status === 'delivered' || status === 'shipped';
    const isWarn = status === 'processing';
    const isBad = status === 'cancelled';
    const Icon = status === 'shipped' ? Truck : isGood ? CheckCircle2 : isWarn ? BarChart3 : isBad ? XCircle : Package;
    return <span className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium capitalize',
        isGood ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
            isWarn ? 'border-amber-500/35 bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                isBad ? 'border-rose-500/35 bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                    'border-blue-500/35 bg-blue-500/10 text-blue-600 dark:text-blue-400',
    )}><Icon aria-hidden="true" className="size-3.5" />{status}</span>;
}

const swatches = [
    'from-lime-400 to-emerald-900', 'from-stone-400 to-stone-800',
    'from-sky-400 to-blue-900', 'from-amber-300 to-orange-900',
    'from-violet-300 to-fuchsia-900', 'from-red-300 to-rose-900',
    'from-teal-300 to-cyan-900', 'from-slate-400 to-slate-900',
];
function StatCard({ title, value, sparkline }: { title: string; value: string; sparkline?: boolean }) {
    return <div className="relative min-w-0 overflow-hidden rounded-xl border border-border bg-card px-5 py-5 shadow-sm">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        {sparkline && <svg aria-hidden="true" viewBox="0 0 220 22" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-5 w-full text-muted-foreground/55">
            <path d="M0 18 C20 12,30 22,48 16 S90 12,113 14 S156 5,175 11 S202 3,220 10" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>}
    </div>;
}

export default function CommerceTablesLab({ node }: { node: ComponentNode }) {
    const originalProducts = (Array.isArray(node.props.products) ? node.props.products : []) as Product[];
    const originalOrders = (Array.isArray(node.props.orders) ? node.props.orders : []) as Order[];
    const [products, setProducts] = useState<Product[]>(originalProducts);
    const [orders, setOrders] = useState<Order[]>(originalOrders);
    const [mode, setMode] = useState<Mode>('products');
    const [search, setSearch] = useState('');
    const [statusTab, setStatusTab] = useState('all');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [columnsOpen, setColumnsOpen] = useState(false);
    const [draftQuery, setDraftQuery] = useState<FilterGroup>(emptyGroup);
    const [appliedQuery, setAppliedQuery] = useState<FilterGroup>(emptyGroup);
    const [visible, setVisible] = useState<string[]>(defaultColumns('products'));
    const [columnDraft, setColumnDraft] = useState<string[]>(defaultColumns('products'));
    const [sortBy, setSortBy] = useState('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [groupBy, setGroupBy] = useState('none');
    const [groupDirection, setGroupDirection] = useState<'asc' | 'desc'>('asc');
    const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [perPage, setPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [dialog, setDialog] = useState<RowAction>(null);
    const [form, setForm] = useState<FormValues>({ ...emptyForm });
    const [notice, setNotice] = useState('');

    const isProducts = mode === 'products';
    const fields = isProducts ? fieldsForProducts : fieldsForOrders;
    const columns = isProducts ? productColumns : orderColumns;
    const rows: RecordRow[] = isProducts ? products : orders;
    const liveColumns = columns.filter(c => visible.includes(c.key));

    const matching = useMemo(() => {
        const text = search.trim().toLocaleLowerCase();
        return rows.filter(row => {
            if (!isProducts && statusTab !== 'all' && valueOf(row, 'status') !== statusTab) return false;
            if (text && !Object.values(row).some(v => String(v ?? '').toLocaleLowerCase().includes(text))) return false;
            return evaluateQuery(row, appliedQuery, fields);
        });
    }, [rows, isProducts, statusTab, search, appliedQuery, fields]);

    const sorted = useMemo(() => [...matching].sort((a, b) => {
        if (groupBy !== 'none') {
            const cmp = String(valueOf(a, groupBy) ?? '').localeCompare(String(valueOf(b, groupBy) ?? ''));
            if (cmp !== 0) return groupDirection === 'asc' ? cmp : -cmp;
        }
        const av = valueOf(a, sortBy) ?? '';
        const bv = valueOf(b, sortBy) ?? '';
        const compare = typeof av === 'number' && typeof bv === 'number'
            ? av - bv
            : String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' });
        return sortDirection === 'asc' ? compare : -compare;
    }), [matching, sortBy, sortDirection, groupBy, groupDirection]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const displayed = sorted.slice((currentPage - 1) * perPage, currentPage * perPage);
    const selectedHere = displayed.filter(row => selected.includes(row.id));
    const allOnPageSelected = displayed.length > 0 && selectedHere.length === displayed.length;
    const statusCounts = useMemo(() => {
        const totals: Record<string, number> = { all: orders.length };
        for (const order of orders) totals[order.status] = (totals[order.status] ?? 0) + 1;
        return totals;
    }, [orders]);
    const groups = new Map<string, RecordRow[]>();
    for (const row of displayed) {
        const key = groupBy === 'none' ? '' : String(valueOf(row, groupBy) ?? 'Not set');
        groups.set(key, [...(groups.get(key) ?? []), row]);
    }
    const first = sorted.length ? (currentPage - 1) * perPage + 1 : 0;
    const last = Math.min(currentPage * perPage, sorted.length);
    const activeCount = countRules(appliedQuery);
    const currentDialogRow = dialog?.id ? rows.find(row => row.id === dialog.id) : null;

    function changeMode(next: Mode) {
        setMode(next);
        setFiltersOpen(false);
        setColumnsOpen(false);
        setSearch('');
        setStatusTab('all');
        setDraftQuery(emptyGroup());
        setAppliedQuery(emptyGroup());
        setVisible(defaultColumns(next));
        setColumnDraft(defaultColumns(next));
        setSortBy(next === 'products' ? 'name' : 'number');
        setSortDirection('asc');
        setGroupBy('none');
        setCollapsedGroups([]);
        setSelected([]);
        setPage(1);
        setNotice('');
    }
    function resetFilters() {
        const empty = emptyGroup();
        setDraftQuery(empty);
        setAppliedQuery(empty);
        setSelected([]);
        setPage(1);
        setNotice('Advanced filters reset.');
    }
    function applyFilters() {
        const issues = validateQuery(draftQuery, fields);
        if (issues.length) { setNotice(issues.join(' ')); return; }
        setAppliedQuery(structuredClone(draftQuery));
        setSelected([]);
        setPage(1);
        setFiltersOpen(false);
        setNotice('Advanced filters applied to fictional records.');
    }
    function toggleSort(key: string) {
        setSortDirection(sortBy === key && sortDirection === 'asc' ? 'desc' : 'asc');
        setSortBy(key);
        setPage(1);
    }
    function toggleRow(id: number, checked: boolean) {
        setSelected(prev => checked ? [...new Set([...prev, id])] : prev.filter(x => x !== id));
    }
    function togglePage(checked: boolean) {
        const ids = displayed.map(row => row.id);
        setSelected(prev => checked ? [...new Set([...prev, ...ids])] : prev.filter(id => !ids.includes(id)));
    }
    function deleteSelected() {
        const ids = dialog?.id ? [dialog.id] : selected;
        if (isProducts) setProducts(prev => prev.filter(row => !ids.includes(row.id)));
        else setOrders(prev => prev.filter(row => !ids.includes(row.id)));
        setSelected([]);
        setDialog(null);
        setNotice(ids.length + ' fictional records deleted locally.');
    }
    function duplicateRow(row: RecordRow) {
        if (isProducts) {
            const product = row as Product;
            const id = Math.max(0, ...products.map(x => x.id)) + 1;
            setProducts(prev => [{ ...product, id, name: product.name + ' (copy)', sku: String(id).padStart(8, '0') }, ...prev]);
        } else {
            const order = row as Order;
            const id = Math.max(0, ...orders.map(x => x.id)) + 1;
            setOrders(prev => [{ ...order, id, number: 'OR' + String(600000 + id) }, ...prev]);
        }
        setNotice('Fictional record duplicated locally.');
    }
    function createRecord(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isProducts) {
            const id = Math.max(0, ...products.map(x => x.id)) + 1;
            const price = Number(form.price);
            const quantity = Number(form.quantity);
            if (!form.name.trim() || !Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity < 0) return;
            setProducts(prev => [{
                id, name: form.name.trim(), slug: 'demo-product-' + id, brand: form.brand.trim() || 'Demo brand',
                price, compare_at_price: price * 1.2, cost_per_item: price * 0.6, quantity,
                security_stock: 5, sku: String(id).padStart(8, '0'), barcode: 'DEMO' + id,
                description: 'New fictitious demo product', visibility: true, featured: false,
                backorder: false, requires_shipping: true, published_at: '2026-11-02', thumbnail: id % 8,
            }, ...prev]);
        } else {
            const id = Math.max(0, ...orders.map(x => x.id)) + 1;
            const total = Number(form.total_price);
            const shipping = Number(form.shipping_cost);
            if (!form.customer.trim() || !Number.isFinite(total) || total < 0 || !Number.isFinite(shipping) || shipping < 0) return;
            setOrders(prev => [{
                id, number: 'OR' + String(600000 + id), customer: form.customer.trim(),
                status: form.status, total_price: total, shipping_cost: shipping, order_date: '2026-11-02',
            }, ...prev]);
        }
        setDialog(null);
        setPage(1);
        setNotice('New fictional record created locally.');
    }
    function openCreate() {
        setForm({ ...emptyForm });
        setDialog({ kind: 'create' });
    }
    function renderCell(row: RecordRow, key: string) {
        const data = valueOf(row, key);
        if (key === 'thumbnail') {
            const p = row as Product;
            return <div aria-label="Demo product thumbnail" className={'flex size-10 items-center justify-center rounded-sm bg-gradient-to-br text-white ' + swatches[p.thumbnail % swatches.length]}><Package className="size-5 opacity-80" /></div>;
        }
        if (typeof data === 'boolean') return data
            ? <CheckCircle2 className="size-5 text-emerald-500" aria-label="Yes" />
            : <XCircle className="size-5 text-rose-500" aria-label="No" />;
        if (key === 'status') return <StatusBadge status={String(data ?? '')} />;
        if (['price', 'compare_at_price', 'cost_per_item', 'total_price', 'shipping_cost'].includes(key)) return money(Number(data ?? 0));
        return String(data ?? '—');
    }
    const paging = Array.from(new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]
        .filter(n => n >= 1 && n <= totalPages))).sort((a, b) => a - b);
    const metrics = isProducts ? [
        ['Total products', String(matching.length)],
        ['Product inventory', String(sum(matching, 'quantity'))],
        ['Average price', money(matching.length ? sum(matching, 'price') / matching.length : 0)],
    ] : [
        ['Orders', String(matching.length)],
        ['Open orders', String(matching.filter(x => ['new', 'processing'].includes(String(valueOf(x, 'status')))).length)],
        ['Average order value', money(matching.length ? sum(matching, 'total_price') / matching.length : 0)],
    ];
    const groupChoices = isProducts
        ? [{ value: 'none', label: 'None' }, { value: 'brand', label: 'Brand' }, { value: 'visibility', label: 'Visibility' }]
        : [{ value: 'none', label: 'None' }, { value: 'status', label: 'Status' }, { value: 'order_date', label: 'Order date' }];
    return <div className="min-w-0 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <button type="button" onClick={() => changeMode('products')} className={cn('hover:text-foreground', isProducts && 'font-semibold text-foreground')}>Products</button>
                    <span>/</span>
                    <button type="button" onClick={() => changeMode('orders')} className={cn('hover:text-foreground', !isProducts && 'font-semibold text-foreground')}>Orders</button>
                    <span>/</span><span>List</span>
                </div>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">{isProducts ? 'Products' : 'Orders'}</h2>
            </div>
            <button type="button" onClick={openCreate} className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"><Plus className="size-4" />{isProducts ? 'New product' : 'New order'}</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
            {metrics.map(([title, value]) => <StatCard key={title} title={title} value={value} sparkline={!isProducts} />)}
        </div>

        {!isProducts && <div role="tablist" aria-label="Order status" className="mx-auto flex w-fit max-w-full flex-wrap items-center gap-1 rounded-xl border border-border bg-card p-1.5">
            {statuses.map(status => <button key={status} type="button" role="tab" aria-selected={statusTab === status}
                onClick={() => { setStatusTab(status); setSelected([]); setPage(1); }}
                className={cn('inline-flex min-h-8 items-center gap-2 rounded-lg px-3 text-xs capitalize text-muted-foreground hover:text-foreground', statusTab === status && 'bg-muted font-semibold text-foreground')}>
                {status === 'all' ? 'All' : status}
                <span className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] tabular-nums">{statusCounts[status] ?? 0}</span>
            </button>)}
        </div>}

        <section aria-label={isProducts ? 'Products table' : 'Orders table'} className="min-w-0 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex min-h-13 flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                    {selected.length > 0 ? <>
                        <span className="text-xs font-medium">{selected.length} selected</span>
                        <button type="button" className={button + ' text-rose-600 dark:text-rose-400'} onClick={() => setDialog({ kind: 'delete' })}><Trash2 className="size-4" />Delete selected</button>
                        <button type="button" className="text-xs text-muted-foreground hover:underline" onClick={() => setSelected([])}>Clear</button>
                    </> : <>
                        <span className="text-xs text-muted-foreground">Group by</span>
                        <SearchableSelect label="Group by" value={groupBy} options={groupChoices} className="w-40" size="sm"
                            onValueChange={next => { setGroupBy(next); setCollapsedGroups([]); setPage(1); }} />
                        {groupBy !== 'none' && <SearchableSelect label="Group direction" size="sm" className="w-32" value={groupDirection}
                            options={[{ value: 'asc', label: 'Ascending' }, { value: 'desc', label: 'Descending' }]}
                            onValueChange={value => setGroupDirection(value as 'asc' | 'desc')} />}
                    </>}
                </div>
                <div className="flex min-w-0 items-center gap-1.5">
                    <label className="relative min-w-0 flex-1 sm:w-56">
                        <Search aria-hidden="true" className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <span className="sr-only">Search records</span>
                        <input type="search" value={search} onChange={e => { setSearch(e.target.value); setPage(1); setSelected([]); }}
                            placeholder="Search" className={input + ' ps-9'} />
                    </label>
                    <button type="button" className={iconButton} aria-label="Advanced filters" aria-expanded={filtersOpen}
                        onClick={() => { setFiltersOpen(!filtersOpen); setColumnsOpen(false); if (!filtersOpen) setDraftQuery(structuredClone(appliedQuery)); }}>
                        <Filter className="size-4" />
                        {activeCount > 0 && <span className="absolute -mt-7 ms-7 rounded-full bg-blue-500 px-1 text-[10px] text-white">{activeCount}</span>}
                    </button>
                    <div className="relative">
                        <button type="button" className={iconButton} aria-label="Manage columns" aria-expanded={columnsOpen}
                            onClick={() => { setColumnsOpen(!columnsOpen); setFiltersOpen(false); setColumnDraft([...visible]); }}><Columns3 className="size-4" /></button>
                        {columnsOpen && <div className="absolute end-0 z-30 mt-2 w-[min(90vw,270px)] space-y-3 rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-xl">
                            <div className="flex items-center justify-between gap-3"><h3 className="font-semibold">Columns</h3><button type="button" className="text-xs text-rose-500 hover:underline" onClick={() => setColumnDraft(defaultColumns(mode))}>Reset</button></div>
                            {columns.map(column => <label key={column.key} className="flex items-center gap-2 text-sm">
                                <Checkbox aria-label={column.label} checked={columnDraft.includes(column.key)}
                                    onCheckedChange={checked => setColumnDraft(prev => checked ? [...new Set([...prev, column.key])] : prev.filter(key => key !== column.key))} />
                                {column.label}
                            </label>)}
                            <button type="button" disabled={columnDraft.length === 0} className="h-9 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white disabled:opacity-40" onClick={() => { setVisible(columnDraft); setColumnsOpen(false); }}>Apply columns</button>
                        </div>}
                    </div>
                </div>
            </div>
            {filtersOpen && <QueryBuilderEditor value={draftQuery} fields={fields} onChange={setDraftQuery}
                onReset={resetFilters} onApply={applyFilters} onClose={() => setFiltersOpen(false)} />}
            {activeCount > 0 && <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2 text-xs text-muted-foreground">
                <span className="rounded-md bg-blue-600/10 px-2 py-1 font-medium text-blue-600 dark:text-blue-400">{activeCount} active filter rules</span>
                <button type="button" className="hover:underline" onClick={resetFilters}>Clear all</button>
            </div>}

            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-start text-sm">
                    <thead className="bg-muted/60 text-xs font-semibold text-foreground"><tr className="border-b border-border">
                        <th scope="col" className="w-11 px-4 py-3"><Checkbox checked={allOnPageSelected ? true : selectedHere.length > 0 ? 'indeterminate' : false}
                            aria-label="Select all on page" onCheckedChange={checked => togglePage(checked === true)} /></th>
                        {liveColumns.map(col => <th scope="col" key={col.key} className="whitespace-nowrap px-3 py-3 text-start font-semibold">
                            {col.sortable ? <button type="button" className="inline-flex items-center gap-1.5 hover:text-blue-500"
                                aria-label={'Sort by ' + col.label} onClick={() => toggleSort(col.key)}>
                                {col.label}<ChevronDown className={cn('size-3.5 text-muted-foreground', sortBy === col.key && sortDirection === 'asc' && 'rotate-180 text-blue-500')} />
                            </button> : col.label}
                        </th>)}
                        <th scope="col" className="w-12 px-3 py-3"><span className="sr-only">Actions</span></th>
                    </tr></thead>
                    <tbody>
                        {[...groups.entries()].map(([groupLabel, groupRows]) => <FragmentRows key={groupLabel}
                            groupLabel={groupLabel} grouped={groupBy !== 'none'}
                            collapsed={collapsedGroups.includes(groupLabel)}
                            onToggle={() => setCollapsedGroups(prev => prev.includes(groupLabel) ? prev.filter(x => x !== groupLabel) : [...prev, groupLabel])}
                            colspan={liveColumns.length + 2}>
                            {groupRows.map(row => <tr key={row.id} className="border-b border-border/70 hover:bg-muted/40">
                                <td className="px-4 py-3"><Checkbox aria-label={'Select record ' + row.id}
                                    checked={selected.includes(row.id)} onCheckedChange={checked => toggleRow(row.id, checked === true)} /></td>
                                {liveColumns.map(col => <td key={col.key} className="whitespace-nowrap px-3 py-3 text-start text-xs text-foreground sm:text-sm">{renderCell(row, col.key)}</td>)}
                                <td className="px-2 py-3 text-end">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><button type="button" className={iconButton} aria-label={'Actions for record ' + row.id}><MoreVertical className="size-4 text-blue-500" /></button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => setDialog({ kind: 'view', id: row.id })}>View details</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => duplicateRow(row)}>Duplicate (demo)</DropdownMenuItem>
                                            <DropdownMenuItem variant="destructive" onSelect={() => setDialog({ kind: 'delete', id: row.id })}>Delete (demo)</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>)}
                        </FragmentRows>)}
                    </tbody>
                </table>
                {sorted.length === 0 && <div className="flex flex-col items-center justify-center gap-3 p-14 text-center"><Search className="size-7 text-muted-foreground" /><h3 className="font-semibold">No matching records</h3><p className="text-sm text-muted-foreground">Try fewer advanced filters or another search term.</p><button type="button" className={button} onClick={() => { resetFilters(); setSearch(''); setStatusTab('all'); }}>Reset table filters</button></div>}
            </div>
            {!isProducts && <div className="space-y-2 border-t border-border px-4 py-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-3"><span className="font-semibold">Summary · This page</span><div className="flex flex-wrap gap-5"><span>Total price: <b>{money(sum(displayed, 'total_price'))}</b></span><span>Shipping: <b>{money(sum(displayed, 'shipping_cost'))}</b></span></div></div>
                <div className="flex flex-wrap items-center justify-between gap-3 text-muted-foreground"><span>All matching orders</span><div className="flex flex-wrap gap-5"><span>Total price: <b>{money(sum(sorted, 'total_price'))}</b></span><span>Shipping: <b>{money(sum(sorted, 'shipping_cost'))}</b></span></div></div>
            </div>}
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs sm:text-sm">
                <p className="text-muted-foreground">Showing {first} to {last} of {sorted.length} results</p>
                <div className="flex items-center gap-2 text-muted-foreground"><span>Per page</span><SearchableSelect label="Rows per page" size="sm" className="w-20"
                    options={[5, 10, 25, 50].map(n => ({ value: String(n), label: String(n) }))} value={String(perPage)}
                    onValueChange={value => { setPerPage(Number(value)); setPage(1); }} /></div>
                <nav aria-label="Table pagination" className="flex items-center overflow-hidden rounded-lg border border-border">
                    <button type="button" className={iconButton} aria-label="First page" disabled={currentPage === 1} onClick={() => setPage(1)}><ChevronsLeft className="size-4" /></button>
                    <button type="button" className={iconButton} aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft className="size-4" /></button>
                    {paging.flatMap((n, index) => [
                        ...(index > 0 && n - paging[index - 1] > 1 ? [<span key={'gap-' + n} className="px-2 text-muted-foreground">…</span>] : []),
                        <button key={n} type="button" onClick={() => setPage(n)} aria-current={n === currentPage ? 'page' : undefined}
                            className={cn('min-w-8 border-s border-border px-2 py-2 text-xs', n === currentPage ? 'bg-blue-500/15 font-semibold text-blue-600 dark:text-blue-400' : 'hover:bg-muted')}>{n}</button>,
                    ])}
                    <button type="button" className={iconButton} aria-label="Next page" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}><ChevronRight className="size-4" /></button>
                    <button type="button" className={iconButton} aria-label="Last page" disabled={currentPage === totalPages} onClick={() => setPage(totalPages)}><ChevronsRight className="size-4" /></button>
                </nav>
            </footer>
        </section>
        <p role="status" aria-live="polite" className="text-xs text-muted-foreground">{notice || 'Fictional data only. This browser demo does not write to Laravel or a database.'}</p>

        <Dialog open={dialog !== null} onOpenChange={open => { if (!open) setDialog(null); }}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{dialog?.kind === 'create' ? (isProducts ? 'New product' : 'New order') : dialog?.kind === 'delete' ? 'Delete fictional records?' : 'Record details'}</DialogTitle>
                    <DialogDescription>Preview only: no Laravel database changes occur.</DialogDescription>
                </DialogHeader>
                {dialog?.kind === 'view' && currentDialogRow && <dl className="grid gap-2 text-sm">{Object.entries(currentDialogRow).map(([key, value]) => <div className="grid grid-cols-2 gap-2 border-b border-border py-1" key={key}><dt className="font-semibold">{key.replaceAll('_', ' ')}</dt><dd className="break-all text-muted-foreground">{String(value)}</dd></div>)}<button type="button" className={button} onClick={() => setDialog(null)}>Close</button></dl>}
                {dialog?.kind === 'delete' && <DialogFooter><button type="button" className={button} onClick={() => setDialog(null)}>Cancel</button><button type="button" className="h-9 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white" onClick={deleteSelected}>Delete locally</button></DialogFooter>}
                {dialog?.kind === 'create' && <form onSubmit={createRecord} className="space-y-3">
                    {isProducts ? <>
                        <label className="block space-y-1 text-sm">Name <input required className={input} value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} /></label>
                        <label className="block space-y-1 text-sm">Brand <input className={input} value={form.brand} onChange={e => setForm(prev => ({ ...prev, brand: e.target.value }))} /></label>
                        <label className="block space-y-1 text-sm">Price <input required type="number" min="0" step="0.01" className={input} value={form.price} onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))} /></label>
                        <label className="block space-y-1 text-sm">Quantity <input required type="number" min="0" step="1" className={input} value={form.quantity} onChange={e => setForm(prev => ({ ...prev, quantity: e.target.value }))} /></label>
                    </> : <>
                        <label className="block space-y-1 text-sm">Customer <input required className={input} value={form.customer} onChange={e => setForm(prev => ({ ...prev, customer: e.target.value }))} /></label>
                        <label className="block space-y-1 text-sm">Status <SearchableSelect label="Order status" className="w-full" value={form.status}
                            options={statuses.filter(status => status !== 'all').map(status => ({ value: status, label: status }))}
                            onValueChange={status => setForm(prev => ({ ...prev, status }))} /></label>
                        <label className="block space-y-1 text-sm">Total price <input required type="number" min="0" step="0.01" className={input} value={form.total_price} onChange={e => setForm(prev => ({ ...prev, total_price: e.target.value }))} /></label>
                        <label className="block space-y-1 text-sm">Shipping cost <input required type="number" min="0" step="0.01" className={input} value={form.shipping_cost} onChange={e => setForm(prev => ({ ...prev, shipping_cost: e.target.value }))} /></label>
                    </>}
                    <DialogFooter><button type="button" className={button} onClick={() => setDialog(null)}>Cancel</button><button type="submit" className="h-9 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white">Create locally</button></DialogFooter>
                </form>}
            </DialogContent>
        </Dialog>
    </div>;
}

function FragmentRows({ groupLabel, grouped, collapsed, onToggle, colspan, children }: {
    groupLabel: string; grouped: boolean; collapsed: boolean;
    onToggle: () => void; colspan: number; children: ReactNode;
}) {
    return <>
        {grouped && <tr className="border-b border-border bg-muted/40"><td colSpan={colspan} className="px-4 py-2">
            <button type="button" aria-expanded={!collapsed} onClick={onToggle} className="inline-flex items-center gap-2 text-xs font-semibold"><ChevronDown className={cn('size-4 transition-transform', collapsed && '-rotate-90')} />{groupLabel || 'Not set'}</button>
        </td></tr>}
        {!collapsed && children}
    </>;
}
