import { useMemo, useState } from 'react';
import type { DragEvent, FormEvent } from 'react';
import {
    ArrowDown, ArrowUp, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight,
    ChevronsLeft, ChevronsRight, Columns3, Download, Eye, Filter, GripVertical,
    Layers3, Pencil, Plus, RotateCcw, Search, Trash2, XCircle,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { TableSelect } from '@/components/ui/table-select';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import type { ComponentNode } from './types';

type Mode = 'users' | 'posts' | 'reorder';
type Direction = 'asc' | 'desc';
type PageStyle = 'numbered' | 'simple';
type UserRow = { id: number; name: string; email: string; role: string; verified: boolean; phone: string };
type PostRow = { id: number; title: string; slug: string; author: string; status: string; featured: boolean; order: number };
type RecordRow = UserRow | PostRow;
type EditValues = { name: string; email: string; role: string; verified: boolean; title: string; author: string; status: string; featured: boolean };
type Modal = { kind: 'create' | 'edit' | 'view' | 'delete' | 'bulk-delete'; id?: number } | null;
type FilterState = { status: string; role: string; verified: string; featured: string };
type Column = { key: string; label: string; sortable?: boolean; hideable?: boolean };

const userColumns: Column[] = [
    { key: 'avatar', label: 'Avatar', hideable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email address', sortable: true, hideable: true },
    { key: 'role', label: 'Role', sortable: true, hideable: true },
    { key: 'verified', label: 'Verified', sortable: true, hideable: true },
    { key: 'phone', label: 'Phone', hideable: true },
];
const postColumns: Column[] = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'slug', label: 'Slug', sortable: true, hideable: true },
    { key: 'status', label: 'Status', sortable: true, hideable: true },
    { key: 'author', label: 'Author', sortable: true, hideable: true },
    { key: 'featured', label: 'Is featured', sortable: true, hideable: true },
];
const initialFilters: FilterState = { status: 'all', role: 'all', verified: 'all', featured: 'all' };

const roles = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Editor', label: 'Editor' },
    { value: 'Member', label: 'Member' },
];
const roleFilterOptions = [{ value: 'all', label: 'All roles' }, ...roles];
const verificationFilterOptions = [
    { value: 'all', label: 'All' },
    { value: 'true', label: 'Verified' },
    { value: 'false', label: 'Not verified' },
];
const statuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'reviewing', label: 'Reviewing' },
    { value: 'published', label: 'Published' },
];
const statusFilterOptions = [{ value: 'all', label: 'All statuses' }, ...statuses];
const featuredFilterOptions = [
    { value: 'all', label: 'All' },
    { value: 'true', label: 'Featured' },
    { value: 'false', label: 'Not featured' },
];
const groupUserOptions = [
    { value: 'none', label: 'None' },
    { value: 'role', label: 'Role' },
    { value: 'verified', label: 'Verified' },
];
const groupPostOptions = [
    { value: 'none', label: 'None' },
    { value: 'status', label: 'Status' },
    { value: 'author', label: 'Author' },
    { value: 'featured', label: 'Featured' },
];
const pageSizeOptions = [5, 10, 25, 50].map((size) => ({ value: String(size), label: String(size) }));
const pageStyleOptions = [
    { value: 'numbered', label: 'Numbered' },
    { value: 'simple', label: 'Simple' },
];
const emptyValues: EditValues = {
    name: '', email: '', role: 'Member', verified: false,
    title: '', author: 'Dan Harrin', status: 'draft', featured: false,
};
const buttonClass = 'inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:pointer-events-none disabled:opacity-40';
const iconButton = 'inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-amber-500';
const controlClass = 'min-h-9 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-amber-500';
const tabModes: Array<{ id: Mode; title: string; subtitle: string }> = [
    { id: 'users', title: 'Users', subtitle: 'Selection · actions · grouping' },
    { id: 'posts', title: 'Blog posts', subtitle: 'Badges · highlights · filters' },
    { id: 'reorder', title: 'Reordering', subtitle: 'Drag & drop · keyboard' },
];

function cellValue(row: RecordRow, key: string): string {
    const value = (row as unknown as Record<string, unknown>)[key];
    return typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value ?? '');
}

function csvCell(value: string): string {
    const safe = /^\s*[=+@-]/.test(value) ? "'" + value : value;
    return '"' + safe.replaceAll('"', '""') + '"';
}

function initialEdit(row?: RecordRow): EditValues {
    return row ? { ...emptyValues, ...(row as unknown as Partial<EditValues>) } : { ...emptyValues };
}

export default function FilamentTablesLab({ node }: { node: ComponentNode }) {
    const seedUsers = (Array.isArray(node.props.users) ? node.props.users : []) as UserRow[];
    const seedPosts = (Array.isArray(node.props.posts) ? node.props.posts : []) as PostRow[];
    const [users, setUsers] = useState<UserRow[]>(seedUsers);
    const [posts, setPosts] = useState<PostRow[]>(seedPosts);
    const [mode, setMode] = useState<Mode>('users');
    const [search, setSearch] = useState('');
    const [draftFilters, setDraftFilters] = useState<FilterState>(initialFilters);
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [filterOpen, setFilterOpen] = useState(false);
    const [columnsOpen, setColumnsOpen] = useState(false);
    const [groupBy, setGroupBy] = useState('none');
    const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
    const [hiddenColumns, setHiddenColumns] = useState<string[]>(['avatar', 'phone']);
    const [columnOrder, setColumnOrder] = useState<string[]>(userColumns.map((column) => column.key));
    const [sort, setSort] = useState<{ key: string; direction: Direction } | null>(null);
    const [selected, setSelected] = useState<number[]>([]);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(5);
    const [pageStyle, setPageStyle] = useState<PageStyle>('numbered');
    const [striped, setStriped] = useState(false);
    const [tinted, setTinted] = useState(false);
    const [compact, setCompact] = useState(false);
    const [showHeader, setShowHeader] = useState(true);
    const [skeleton, setSkeleton] = useState(false);
    const [modal, setModal] = useState<Modal>(null);
    const [values, setValues] = useState<EditValues>(emptyValues);
    const [notice, setNotice] = useState('');
    const [showOptions, setShowOptions] = useState(false);

    const isUsers = mode === 'users';
    const isReordering = mode === 'reorder';
    const columns = isUsers ? userColumns : postColumns;
    const orderedColumns = [...columns].sort((a, b) => columnOrder.indexOf(a.key) - columnOrder.indexOf(b.key));
    const visibleColumns = orderedColumns.filter((column) => !hiddenColumns.includes(column.key));
    const rows = useMemo<RecordRow[]>(() => isUsers ? users : posts, [isUsers, users, posts]);

    const filtered = useMemo(() => {
        const term = search.trim().toLocaleLowerCase();
        const result = rows.filter((row) => {
            const match = !term || Object.values(row).some((value) => String(value).toLocaleLowerCase().includes(term));
            if (!match) return false;
            if (isUsers) {
                const user = row as UserRow;
                return (filters.role === 'all' || filters.role === user.role)
                    && (filters.verified === 'all' || String(user.verified) === filters.verified);
            }
            const post = row as PostRow;
            return (filters.status === 'all' || filters.status === post.status)
                && (filters.featured === 'all' || String(post.featured) === filters.featured);
        });
        if (sort && !isReordering) {
            result.sort((a, b) => {
                const left = cellValue(a, sort.key);
                const right = cellValue(b, sort.key);
                const compared = left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' });
                return (sort.direction === 'asc' ? compared : -compared) || (a.id - b.id);
            });
        }
        return result;
    }, [rows, isUsers, filters, search, sort, isReordering]);

    const lastPage = Math.max(1, Math.ceil(filtered.length / perPage));
    const currentPage = Math.min(page, lastPage);
    const displayed = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
    const selectedOnPage = displayed.filter((row) => selected.includes(row.id));
    const allPageSelected = displayed.length > 0 && selectedOnPage.length === displayed.length;
    const somePageSelected = selectedOnPage.length > 0;
    const activeFilters = isUsers
        ? Number(filters.role !== 'all') + Number(filters.verified !== 'all')
        : Number(filters.status !== 'all') + Number(filters.featured !== 'all');
    const from = filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1;
    const to = Math.min(currentPage * perPage, filtered.length);
    const pageNumbers = Array.from({ length: lastPage }, (_, index) => index + 1)
        .filter((number) => lastPage <= 7 || number <= 2 || number >= lastPage - 1 || Math.abs(number - currentPage) <= 1);
    const filteredIds = filtered.map((row) => row.id);
    const selectedCount = selected.filter((id) => filteredIds.includes(id)).length;

    function changeMode(next: Mode): void {
        setMode(next);
        setSearch('');
        setFilters(initialFilters);
        setDraftFilters(initialFilters);
        setPage(1);
        setSort(null);
        setSelected([]);
        setHiddenColumns(next === 'users' ? ['avatar', 'phone'] : next === 'posts' ? ['slug', 'featured'] : []);
        setColumnOrder((next === 'users' ? userColumns : postColumns).map((column) => column.key));
        setGroupBy('none');
        setCollapsedGroups([]);
        setFilterOpen(false);
        setColumnsOpen(false);
        setNotice('');
    }

    function resetView(): void {
        setSearch('');
        setFilters(initialFilters);
        setDraftFilters(initialFilters);
        setGroupBy('none');
        setSort(null);
        setPage(1);
        setSelected([]);
        setCollapsedGroups([]);
        setNotice('View reset.');
    }

    function toggleSort(key: string): void {
        setSort((old) => ({ key, direction: old?.key === key && old.direction === 'asc' ? 'desc' : 'asc' }));
        setPage(1);
    }

    function togglePageSelection(checked: boolean): void {
        const ids = displayed.map((row) => row.id);
        setSelected((old) => checked ? [...new Set([...old, ...ids])] : old.filter((id) => !ids.includes(id)));
    }

    function moveColumn(key: string, change: number): void {
        setColumnOrder((old) => {
            const index = old.indexOf(key);
            const nextIndex = index + change;
            if (index < 0 || nextIndex < 0 || nextIndex >= old.length) return old;
            const next = [...old];
            [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
            return next;
        });
    }

    function movePost(id: number, target: number): void {
        if (id === target) return;
        setPosts((old) => {
            const next = [...old];
            const fromIndex = next.findIndex((row) => row.id === id);
            const toIndex = next.findIndex((row) => row.id === target);
            if (fromIndex < 0 || toIndex < 0) return old;
            next.splice(toIndex, 0, next.splice(fromIndex, 1)[0]);
            return next.map((row, index) => ({ ...row, order: index }));
        });
        setNotice('Order updated in this browser preview.');
    }

    function openModal(kind: NonNullable<Modal>['kind'], row?: RecordRow): void {
        setValues(initialEdit(row));
        setModal({ kind, id: row?.id });
    }

    function save(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        if (modal?.kind !== 'create' && modal?.kind !== 'edit') return;
        const id = modal.id;
        if (isUsers) {
            if (!values.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return;
            const entry: UserRow = {
                id: id ?? Math.max(0, ...users.map((row) => row.id)) + 1,
                name: values.name.trim(), email: values.email.trim(), role: values.role,
                verified: values.verified, phone: id ? users.find((row) => row.id === id)?.phone ?? '' : '',
            };
            setUsers((old) => id ? old.map((row) => row.id === id ? entry : row) : [entry, ...old]);
        } else {
            if (!values.title.trim()) return;
            const entry: PostRow = {
                id: id ?? Math.max(0, ...posts.map((row) => row.id)) + 1,
                title: values.title.trim(), slug: values.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                author: values.author, status: values.status, featured: values.featured,
                order: id ? posts.find((row) => row.id === id)?.order ?? 0 : 0,
            };
            setPosts((old) => id ? old.map((row) => row.id === id ? entry : row) : [entry, ...old]);
        }
        setModal(null);
        setNotice('Preview record saved locally — no database was changed.');
        setPage(1);
    }

    function confirmDelete(): void {
        if (!modal) return;
        const ids = modal.kind === 'bulk-delete' ? selected : modal.id ? [modal.id] : [];
        if (isUsers) setUsers((old) => old.filter((row) => !ids.includes(row.id)));
        else setPosts((old) => old.filter((row) => !ids.includes(row.id)));
        setSelected([]);
        setModal(null);
        setNotice(String(ids.length) + ' sample record(s) removed locally.');
    }

    function bulkUpdate(): void {
        if (isUsers) setUsers((old) => old.map((row) => selected.includes(row.id) ? { ...row, verified: true } : row));
        else setPosts((old) => old.map((row) => selected.includes(row.id) ? { ...row, status: 'published' } : row));
        setSelected([]);
        setNotice('Selected sample records updated locally.');
    }

    function toggleFeatured(id: number): void {
        setPosts((old) => old.map((row) => row.id === id ? { ...row, featured: !row.featured } : row));
        setNotice('Featured state updated locally.');
    }

    function exportCsv(): void {
        const headings = visibleColumns.filter((column) => column.key !== 'avatar');
        const csv = [headings.map((column) => csvCell(column.label)).join(','),
            ...filtered.map((row) => headings.map((column) => csvCell(cellValue(row, column.key))).join(','))].join('\r\n');
        const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = (isUsers ? 'users' : 'blog-posts') + '-preview.csv';
        link.click();
        URL.revokeObjectURL(url);
        setNotice(String(filtered.length) + ' displayed sample records exported as CSV.');
    }

    function renderCell(row: RecordRow, key: string) {
        const value = cellValue(row, key);
        if (key === 'avatar') return <span aria-label={'Avatar for ' + (row as UserRow).name} className="inline-flex size-8 items-center justify-center rounded-full bg-amber-500/15 text-xs font-semibold text-amber-700 dark:text-amber-300">{(row as UserRow).name.split(' ').map((item) => item[0]).slice(0, 2).join('')}</span>;
        if (key === 'verified' || key === 'featured') {
            const yes = key === 'verified' ? (row as UserRow).verified : (row as PostRow).featured;
            return yes ? <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" aria-label="Yes" /> : <XCircle className="size-5 text-rose-600 dark:text-rose-400" aria-label="No" />;
        }
        if (key === 'status') {
            const tones: Record<string, string> = {
                published: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
                reviewing: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400',
                draft: 'border-border bg-muted text-muted-foreground',
            };
            return <span className={'inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ' + (tones[value] ?? tones.draft)}>{value}</span>;
        }
        if (key === 'role') return <span className="inline-flex rounded-md bg-muted px-2 py-1 text-xs font-medium">{value}</span>;
        return <span dir={key === 'email' || key === 'slug' || key === 'phone' ? 'ltr' : undefined} className="block max-w-[440px] truncate">{value || '—'}</span>;
    }

    function rowTone(row: RecordRow, index: number): string {
        if (tinted && !isUsers) {
            const state = (row as PostRow).status;
            if (state === 'published') return 'bg-emerald-500/[0.07] dark:bg-emerald-500/[0.12]';
            if (state === 'reviewing') return 'bg-amber-500/[0.07] dark:bg-amber-500/[0.12]';
            return 'bg-rose-500/[0.05] dark:bg-rose-500/[0.09]';
        }
        return striped && index % 2 ? 'bg-muted/35' : '';
    }

    function displayRow(row: RecordRow, index: number) {
        const checked = selected.includes(row.id);
        const post = row as PostRow;
        const handleDrop = (event: DragEvent<HTMLTableRowElement>) => {
            event.preventDefault();
            if (!isReordering) return;
            const dragged = Number(event.dataTransfer.getData('text/plain'));
            if (Number.isSafeInteger(dragged)) movePost(dragged, row.id);
        };
        return <tr key={row.id} draggable={isReordering} onDragStart={(event) => event.dataTransfer.setData('text/plain', String(row.id))}
            onDragOver={(event) => { if (isReordering) event.preventDefault(); }} onDrop={handleDrop}
            className={'border-b border-border/70 transition-colors hover:bg-muted/25 ' + rowTone(row, index) + (checked ? ' bg-amber-500/[0.08]' : '')}>
            {isReordering && <td className="w-12 px-3 text-muted-foreground">
                <span title="Drag to reorder" className="inline-flex cursor-grab"><GripVertical className="size-5" /></span>
                <div className="mt-1 inline-flex gap-0.5 sm:hidden">
                    <button type="button" aria-label={'Move ' + post.title + ' up'} className={iconButton} disabled={posts.findIndex((item) => item.id === row.id) === 0}
                        onClick={() => { const previous = posts[posts.findIndex((item) => item.id === row.id) - 1]; if (previous) movePost(row.id, previous.id); }}><ArrowUp className="size-4" /></button>
                    <button type="button" aria-label={'Move ' + post.title + ' down'} className={iconButton} disabled={posts.findIndex((item) => item.id === row.id) === posts.length - 1}
                        onClick={() => { const next = posts[posts.findIndex((item) => item.id === row.id) + 1]; if (next) movePost(row.id, next.id); }}><ArrowDown className="size-4" /></button>
                </div>
            </td>}
            {!isReordering && <td className="w-12 px-4"><Checkbox checked={checked} aria-label={'Select record ' + row.id} onCheckedChange={(value) => setSelected((old) => value === true ? [...new Set([...old, row.id])] : old.filter((id) => id !== row.id))} /></td>}
            {visibleColumns.map((column) => <td key={column.key} className={'px-4 text-start text-sm text-foreground ' + (compact ? 'py-2' : 'py-4')}>{renderCell(row, column.key)}</td>)}
            {!isReordering && <td className="min-w-44 whitespace-nowrap px-3 text-end">
                <div className="flex justify-end gap-1.5">
                    <button type="button" className={iconButton} title="View" aria-label={'View record ' + row.id} onClick={() => openModal('view', row)}><Eye className="size-4" /></button>
                    <button type="button" className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-500/10 dark:text-amber-400" onClick={() => openModal('edit', row)}><Pencil className="size-4" />Edit</button>
                    {!isUsers && <button type="button" className="rounded-md px-1.5 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-500/10 dark:text-amber-400" onClick={() => toggleFeatured(row.id)}>{post.featured ? 'Unfeature' : 'Feature'}</button>}
                    <button type="button" className="inline-flex items-center gap-1 rounded-md px-1.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-500/10 dark:text-rose-400" onClick={() => openModal('delete', row)}><Trash2 className="size-4" />Delete</button>
                </div>
            </td>}
        </tr>;
    }

    const groups = new Map<string, RecordRow[]>();
    for (const row of displayed) {
        const label = groupBy === 'none' ? '' : cellValue(row, groupBy) || '—';
        const bucket = groups.get(label) ?? [];
        bucket.push(row);
        groups.set(label, bucket);
    }
    const modalRow = modal?.id ? rows.find((row) => row.id === modal.id) : undefined;

    return <div className="min-w-0 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
            <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Table scenarios</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Every change is interactive, local and safe to reset.</p>
            </div>
            <div role="group" aria-label="Choose table scenario" className="inline-flex max-w-full flex-wrap gap-1 rounded-lg bg-muted p-1">
                {tabModes.map((tab) => <button type="button" key={tab.id} aria-pressed={mode === tab.id} onClick={() => changeMode(tab.id)}
                    className={'rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-amber-500 ' + (mode === tab.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>{tab.title}</button>)}
            </div>
        </div>

        <section aria-label="Interactive Filament-style table" className="min-w-0 overflow-visible rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
            {showHeader && <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-5 sm:px-6">
                <div className="min-w-0">
                    <h2 className="text-lg font-semibold">{isUsers ? 'Users' : isReordering ? 'Reorder blog posts' : 'Blog Posts'}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{isUsers ? 'Individuals who have registered for the application.' : isReordering ? 'Drag and drop records to change the order.' : 'Manage your blog posts and articles.'}</p>
                </div>
                {!isReordering && <button type="button" onClick={() => openModal('create')} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-black shadow-sm hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"><Plus className="size-4" />{isUsers ? 'New user' : 'New post'}</button>}
            </header>}

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
                <div className="flex flex-wrap items-center gap-2">
                    {isReordering ? <span className="inline-flex items-center gap-2 text-sm text-muted-foreground"><GripVertical className="size-4" />Drag to reorder (desktop) or use row controls (mobile).</span>
                        : selected.length > 0 ? <>
                            <button type="button" className={buttonClass} onClick={bulkUpdate}><Check className="size-4" />{isUsers ? 'Verify selected' : 'Publish selected'} ({selectedCount})</button>
                            <button type="button" className={buttonClass + ' text-rose-600 dark:text-rose-400'} onClick={() => openModal('bulk-delete')}><Trash2 className="size-4" />Delete selected</button>
                            <button type="button" className="text-xs text-amber-600 hover:underline" onClick={() => setSelected(filteredIds)}>Select all {filtered.length}</button>
                            <button type="button" className="text-xs text-muted-foreground hover:underline" onClick={() => setSelected([])}>Deselect all</button>
                        </> : <div className="inline-flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                            <Layers3 aria-hidden="true" className="size-4 shrink-0" />
                            <span className="whitespace-nowrap">Group by</span>
                            <TableSelect label="Group by" size="sm" className="w-36"
                                value={groupBy} options={isUsers ? groupUserOptions : groupPostOptions}
                                onValueChange={(value) => { setGroupBy(value); setCollapsedGroups([]); }} />
                        </div>}
                </div>
                <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
                    <label className="relative min-w-0 flex-1 sm:w-60 sm:flex-none"><Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <span className="sr-only">Search records</span><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); setSelected([]); }} placeholder="Search" className={controlClass + ' w-full ps-10'} />
                    </label>
                    <div className="relative">
                        <button type="button" aria-label="Filters" aria-expanded={filterOpen} className={iconButton} onClick={() => { setFilterOpen(!filterOpen); setColumnsOpen(false); setDraftFilters(filters); }}><Filter className="size-5" />{activeFilters > 0 && <span className="absolute -end-1 -top-1 rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-black">{activeFilters}</span>}</button>
                        {filterOpen && <div className="absolute end-0 z-30 mt-2 w-[min(90vw,320px)] space-y-4 rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-xl">
                            <div className="flex items-center justify-between"><h3 className="font-semibold">Filters</h3><button type="button" className="text-xs text-rose-600 hover:underline" onClick={() => { setFilters(initialFilters); setDraftFilters(initialFilters); setPage(1); }}>Reset</button></div>
                            {isUsers ? <>
                                <div className="space-y-1.5 text-sm"><span className="block font-medium">Role</span>
                                    <SearchableSelect label="Role" className="w-full" value={draftFilters.role} options={roleFilterOptions}
                                        onValueChange={(role) => setDraftFilters((old) => ({ ...old, role }))} />
                                </div>
                                <div className="space-y-1.5 text-sm"><span className="block font-medium">Verified</span>
                                    <SearchableSelect label="Verified" className="w-full" value={draftFilters.verified} options={verificationFilterOptions}
                                        onValueChange={(verified) => setDraftFilters((old) => ({ ...old, verified }))} />
                                </div>
                            </> : <>
                                <div className="space-y-1.5 text-sm"><span className="block font-medium">Status</span>
                                    <SearchableSelect label="Status" className="w-full" value={draftFilters.status} options={statusFilterOptions}
                                        onValueChange={(status) => setDraftFilters((old) => ({ ...old, status }))} />
                                </div>
                                <div className="space-y-1.5 text-sm"><span className="block font-medium">Is featured</span>
                                    <SearchableSelect label="Is featured" className="w-full" value={draftFilters.featured} options={featuredFilterOptions}
                                        onValueChange={(featured) => setDraftFilters((old) => ({ ...old, featured }))} />
                                </div>
                            </>}
                            <button type="button" onClick={() => { setFilters(draftFilters); setFilterOpen(false); setPage(1); setSelected([]); }} className="min-h-10 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-black hover:bg-amber-400">Apply filters</button>
                        </div>}
                    </div>
                    <div className="relative">
                        <button type="button" aria-label="Manage columns" aria-expanded={columnsOpen} className={iconButton} onClick={() => { setColumnsOpen(!columnsOpen); setFilterOpen(false); }}><Columns3 className="size-5" /></button>
                        {columnsOpen && <div className="absolute end-0 z-30 mt-2 w-72 space-y-3 rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-xl">
                            <div className="flex items-center justify-between"><h3 className="font-semibold">Columns</h3><button type="button" className="text-xs text-amber-600 hover:underline" onClick={() => { setHiddenColumns([]); setColumnOrder(columns.map((column) => column.key)); }}>Reset</button></div>
                            {orderedColumns.map((column) => <div key={column.key} className="flex items-center justify-between gap-2">
                                <label className="flex min-w-0 items-center gap-2 text-sm"><Checkbox checked={!hiddenColumns.includes(column.key)} disabled={!column.hideable || (!hiddenColumns.includes(column.key) && visibleColumns.length === 1)} onCheckedChange={(value) => setHiddenColumns((old) => value === true ? old.filter((key) => key !== column.key) : [...old, column.key])} />{column.label}</label>
                                <div className="flex"><button type="button" className={iconButton} aria-label={'Move ' + column.label + ' left'} onClick={() => moveColumn(column.key, -1)} disabled={columnOrder.indexOf(column.key) === 0}><ArrowUp className="size-4" /></button>
                                    <button type="button" className={iconButton} aria-label={'Move ' + column.label + ' right'} onClick={() => moveColumn(column.key, 1)} disabled={columnOrder.indexOf(column.key) === columnOrder.length - 1}><ArrowDown className="size-4" /></button></div>
                            </div>)}
                        </div>}
                    </div>
                    <button type="button" className={iconButton} title="Export CSV" aria-label="Export CSV" onClick={exportCsv}><Download className="size-5" /></button>
                </div>
            </div>

            <div className="min-w-0 overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse text-start text-sm">
                    <thead className="bg-muted/60"><tr className="border-b border-border">
                        {isReordering ? <th scope="col" className="w-12 px-3 py-3"><span className="sr-only">Reorder</span></th> : <th scope="col" className="w-12 px-4 py-3"><Checkbox aria-label="Select all records on this page" checked={allPageSelected ? true : somePageSelected ? 'indeterminate' : false} onCheckedChange={(value) => togglePageSelection(value === true)} /></th>}
                        {visibleColumns.map((column) => <th scope="col" key={column.key} aria-sort={sort?.key === column.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined} className="whitespace-nowrap px-4 py-3 text-start text-sm font-semibold">
                            {column.sortable && !isReordering ? <button type="button" onClick={() => toggleSort(column.key)} className="inline-flex items-center gap-2 rounded focus-visible:outline-2 focus-visible:outline-amber-500">{column.label}<ChevronDown className={'size-4 text-muted-foreground ' + (sort?.key === column.key && sort.direction === 'asc' ? 'rotate-180' : '')} /></button> : column.label}
                        </th>)}
                        {!isReordering && <th scope="col" className="px-3 py-3 text-end"><span className="sr-only">Actions</span></th>}
                    </tr></thead>
                    <tbody>
                        {skeleton ? Array.from({ length: perPage }, (_, index) => <tr key={index} className="border-b border-border/70" aria-hidden="true"><td className="p-4"><div className="size-5 animate-pulse rounded bg-muted" /></td>{visibleColumns.map((column) => <td className="px-4 py-4" key={column.key}><div className="h-5 w-4/5 max-w-40 animate-pulse rounded bg-muted" /></td>)}{!isReordering && <td className="px-4"><div className="ms-auto h-5 w-20 animate-pulse rounded bg-muted" /></td>}</tr>)
                            : Array.from(groups.entries()).flatMap(([group, members]) => [
                                ...(groupBy === 'none' ? [] : [<tr key={'group-' + group} className="bg-muted/40"><td colSpan={visibleColumns.length + (isReordering ? 1 : 2)} className="px-4 py-3 font-semibold"><button type="button" aria-expanded={!collapsedGroups.includes(group)} className="inline-flex items-center gap-2" onClick={() => setCollapsedGroups((old) => old.includes(group) ? old.filter((value) => value !== group) : [...old, group])}><ChevronDown className={'size-4 ' + (collapsedGroups.includes(group) ? '-rotate-90' : '')} />{groupBy}: {group} <span className="text-xs font-normal text-muted-foreground">({members.length})</span></button></td></tr>]),
                                ...(collapsedGroups.includes(group) ? [] : members.map((row, index) => displayRow(row, index))),
                            ])}
                    </tbody>
                </table>
                {!skeleton && filtered.length === 0 && <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center"><Search className="size-8 text-muted-foreground" /><h3 className="text-base font-semibold">No matching records</h3><p className="max-w-sm text-sm text-muted-foreground">Try a different search or reset your filters.</p><button type="button" onClick={resetView} className={buttonClass}><RotateCcw className="size-4" />Clear filters</button></div>}
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-4 py-3 text-sm sm:px-5">
                <p aria-live="polite" className="text-muted-foreground">Showing {from} to {to} of {filtered.length} results</p>
                <div className="inline-flex items-center gap-2 text-muted-foreground"><span>Per page</span>
                    <TableSelect label="Rows per page" size="sm" className="w-20"
                        value={String(perPage)} options={pageSizeOptions}
                        onValueChange={(value) => { setPerPage(Number(value)); setPage(1); }} />
                </div>
                <nav aria-label="Table pagination" className="flex items-center gap-0 overflow-hidden rounded-lg border border-border bg-background">
                    {pageStyle === 'numbered' && <button type="button" className={iconButton} disabled={currentPage === 1} aria-label="First page" onClick={() => setPage(1)}><ChevronsLeft className="size-4" /></button>}
                    <button type="button" className={iconButton} disabled={currentPage === 1} aria-label="Previous page" onClick={() => setPage(currentPage - 1)}><ChevronLeft className="size-4" /></button>
                    {pageStyle === 'numbered' ? pageNumbers.flatMap((number, index) => [
                        ...(index > 0 && number - pageNumbers[index - 1] > 1 ? [<span key={'gap-' + number} className="px-2 text-muted-foreground">…</span>] : []),
                        <button type="button" key={'page-' + number} aria-label={'Page ' + number} aria-current={currentPage === number ? 'page' : undefined} className={'min-w-9 border-s border-border px-2 py-2 text-sm ' + (currentPage === number ? 'bg-amber-500/15 font-semibold text-amber-600 dark:text-amber-400' : 'hover:bg-muted')} onClick={() => setPage(number)}>{number}</button>,
                    ]) : <span className="px-3 text-xs text-muted-foreground">{currentPage} / {lastPage}</span>}
                    <button type="button" className={iconButton} disabled={currentPage === lastPage} aria-label="Next page" onClick={() => setPage(currentPage + 1)}><ChevronRight className="size-4" /></button>
                    {pageStyle === 'numbered' && <button type="button" className={iconButton} disabled={currentPage === lastPage} aria-label="Last page" onClick={() => setPage(lastPage)}><ChevronsRight className="size-4" /></button>}
                </nav>
            </footer>
        </section>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-semibold">Appearance & behavior playground</h3><p className="mt-1 text-xs text-muted-foreground">Toggle the rendering features below and see the table change immediately.</p></div>
                <button type="button" className={buttonClass} onClick={() => setShowOptions(!showOptions)}><ChevronDown className={'size-4 ' + (showOptions ? 'rotate-180' : '')} />{showOptions ? 'Hide options' : 'All table options'}</button></div>
            {showOptions && <div className="mt-4 flex flex-wrap gap-x-6 gap-y-4 border-t border-border pt-4">
                {([['striped', striped, setStriped, 'Striped rows'], ['tinted', tinted, setTinted, 'Status-colored rows'], ['compact', compact, setCompact, 'Compact density'], ['showHeader', showHeader, setShowHeader, 'Header'], ['skeleton', skeleton, setSkeleton, 'Skeleton loading']] as const).map(([key, value, setter, title]) => <label key={key} className="inline-flex cursor-pointer items-center gap-2 text-sm"><Checkbox checked={value} onCheckedChange={(checked) => setter(checked === true)} />{title}</label>)}
                <div className="inline-flex items-center gap-2 text-sm"><span>Pagination</span>
                    <TableSelect label="Pagination" size="sm" className="w-36" value={pageStyle}
                        options={pageStyleOptions} onValueChange={(value) => setPageStyle(value as PageStyle)} />
                </div>
                <button type="button" className={buttonClass} onClick={resetView}><RotateCcw className="size-4" />Reset search & filters</button>
            </div>}
        </div>

        <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Records (demo)</p><p className="mt-2 text-2xl font-semibold">{rows.length}</p></div><div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Matching filters</p><p className="mt-2 text-2xl font-semibold">{filtered.length}</p></div><div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Current page</p><p className="mt-2 text-2xl font-semibold">{currentPage} / {lastPage}</p></div></div>
        <p role="status" aria-live="polite" className="text-xs text-muted-foreground">{notice || 'Preview only: the 51 users and 50 posts are fictitious. No server writes occur.'}</p>
        <details className="rounded-xl border border-border bg-card p-4"><summary className="cursor-pointer text-sm font-semibold">PHP: existing Lavertia Table API (real, database-backed example)</summary><p className="my-3 text-xs text-muted-foreground">The UI lab above is implemented in React. These capabilities below are implemented by the actual Lavertia Table protocol; bulk actions, row CRUD, grouped queries and reordering are not yet package APIs.</p><pre className="overflow-auto rounded-lg bg-muted p-4 text-xs leading-6" dir="ltr"><code>{'Table::make(\'showcase-tickets\')\n    ->label(\'My tickets\')\n    ->searchable()\n    ->columnManager()\n    ->filters([SelectFilter::make(\'status\')->options([\'draft\' => \'Draft\', \'published\' => \'Published\'])])\n    ->columns([\n        TextColumn::make(\'title\')->sortable()->searchable(),\n        TextColumn::make(\'status\')->badge([\'published\' => \'success\']),\n    ])\n    ->eloquent($tenantScopedQuery, $authorize, perPage: 5);'}</code></pre></details>

        <Dialog open={modal !== null} onOpenChange={(open) => { if (!open) setModal(null); }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader><DialogTitle>{modal?.kind === 'create' ? (isUsers ? 'New user' : 'New post') : modal?.kind === 'edit' ? 'Edit record' : modal?.kind === 'view' ? 'Record details' : modal?.kind === 'bulk-delete' ? 'Delete selected records' : 'Delete record'}</DialogTitle><DialogDescription>{modal?.kind?.includes('delete') ? 'This removes only fictional rows from your local preview. It cannot be undone in this session.' : 'This demo does not save changes to Laravel or the database.'}</DialogDescription></DialogHeader>
            {modal?.kind === 'delete' || modal?.kind === 'bulk-delete' ? <DialogFooter><button type="button" className={buttonClass} onClick={() => setModal(null)}>Cancel</button><button type="button" className="min-h-9 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-500" onClick={confirmDelete}><Trash2 className="me-2 inline size-4" />Delete {modal.kind === 'bulk-delete' ? selected.length + ' selected' : ''}</button></DialogFooter>
                : modal?.kind === 'view' && modalRow ? <dl className="grid gap-3 text-sm">{Object.entries(modalRow).map(([key, value]) => <div className="grid grid-cols-3 gap-3 border-b border-border pb-2" key={key}><dt className="font-semibold capitalize">{key}</dt><dd className="col-span-2 break-all text-muted-foreground">{String(value)}</dd></div>)}<button type="button" className={buttonClass} onClick={() => setModal(null)}>Close</button></dl>
                    : (modal?.kind === 'create' || modal?.kind === 'edit') ? <form onSubmit={save} className="space-y-4">
                        {isUsers ? <>
                            <label className="block space-y-1.5 text-sm">Name <input required className={controlClass + ' w-full'} value={values.name} onChange={(event) => setValues((old) => ({ ...old, name: event.target.value }))} /></label>
                            <label className="block space-y-1.5 text-sm">Email address <input required type="email" className={controlClass + ' w-full'} value={values.email} onChange={(event) => setValues((old) => ({ ...old, email: event.target.value }))} /></label>
                            <div className="space-y-1.5 text-sm"><span className="block font-medium">Role</span>
                                <SearchableSelect label="User role" className="w-full" value={values.role}
                                    options={roles} onValueChange={(role) => setValues((old) => ({ ...old, role }))} />
                            </div>
                            <label className="inline-flex items-center gap-2 text-sm"><Checkbox checked={values.verified} onCheckedChange={(value) => setValues((old) => ({ ...old, verified: value === true }))} />Verified</label>
                        </> : <>
                            <label className="block space-y-1.5 text-sm">Title <input required className={controlClass + ' w-full'} value={values.title} onChange={(event) => setValues((old) => ({ ...old, title: event.target.value }))} /></label>
                            <label className="block space-y-1.5 text-sm">Author <input required className={controlClass + ' w-full'} value={values.author} onChange={(event) => setValues((old) => ({ ...old, author: event.target.value }))} /></label>
                            <div className="space-y-1.5 text-sm"><span className="block font-medium">Status</span>
                                <SearchableSelect label="Post status" className="w-full" value={values.status}
                                    options={statuses} onValueChange={(status) => setValues((old) => ({ ...old, status }))} />
                            </div>
                            <label className="inline-flex items-center gap-2 text-sm"><Checkbox checked={values.featured} onCheckedChange={(value) => setValues((old) => ({ ...old, featured: value === true }))} />Featured</label>
                        </>}
                        <DialogFooter><button type="button" className={buttonClass} onClick={() => setModal(null)}>Cancel</button><button type="submit" className="min-h-9 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-black hover:bg-amber-400">Save locally</button></DialogFooter>
                    </form> : null}
        </DialogContent></Dialog>
    </div>;
}