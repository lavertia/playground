import { useState } from 'react';
import { createRoot } from 'react-dom/client';

import '../../css/app.css';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { TableSelect } from '@/components/ui/table-select';
import { ConstraintPicker } from '@/components/lavertia/constraint-picker';
import { LavertiaTable } from '@/components/lavertia/lavertia-table';
import type { ComponentNode } from '@/components/lavertia/types';

const ROLES = [
    { value: 'all', label: 'All roles' },
    { value: 'Admin', label: 'Admin' },
    { value: 'Editor', label: 'Editor' },
    { value: 'Member', label: 'Member' },
];

const sampleTable: ComponentNode = {
    type: 'table', key: 'table-smoke',
    props: {
        name: 'smoke-table', label: 'Native Table Preview', mode: 'snapshot',
        searchable: true, columnManager: true, reorderableColumns: true,
        groupOptions: { status: 'Status' },
        rows: [
            { id: 1, name: 'Alpha Product', status: 'published', is_featured: true },
            { id: 2, name: 'Beta Product', status: 'draft', is_featured: false },
            { id: 3, name: 'Gamma Product', status: 'published', is_featured: true },
        ],
    },
    components: [
        { type: 'text-column', key: 'id', props: { name: 'id', hidden: true }, components: [] },
        { type: 'text-column', key: 'name', props: { name: 'name', label: 'Name', sortable: true, searchable: true, toggleable: true }, components: [] },
        { type: 'text-column', key: 'status', props: { name: 'status', label: 'Status', badge: true, badgeTones: { published: 'success', draft: 'neutral' }, toggleable: true }, components: [] },
        { type: 'icon-column', key: 'featured', props: { name: 'is_featured', label: 'Featured', boolean: true, toggleable: true }, components: [] },
        { type: 'select-filter', key: 'status-filter', props: { name: 'status', label: 'Status', options: { published: 'Published', draft: 'Draft' } }, components: [] },
    ],
};

function Harness() {
    const [role, setRole] = useState('all');
    const [group, setGroup] = useState('none');
    const [direction, setDirection] = useState('asc');
    const [field, setField] = useState('name');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [dialogRole, setDialogRole] = useState('Member');
    const [submitted, setSubmitted] = useState('');

    return (
        <main className="mx-auto flex max-w-xl flex-col gap-8 p-10">
            <section data-testid="group-control">
                <h2>Group by</h2>
                <SearchableSelect
                    label="Group by"
                    value={group}
                    options={[
                        { value: 'none', label: 'None' },
                        { value: 'role', label: 'Role' },
                        { value: 'verified', label: 'Verified' },
                    ]}
                    onValueChange={setGroup}
                    size="sm"
                />
                <output data-testid="group-value">{group}</output>
            </section>
            <section data-testid="compact-control">
                <h2>Compact shadcn Select</h2>
                <TableSelect
                    label="Group direction"
                    value={direction}
                    options={[
                        { value: 'asc', label: 'Ascending' },
                        { value: 'desc', label: 'Descending' },
                    ]}
                    onValueChange={setDirection}
                />
                <output data-testid="direction-value">{direction}</output>
            </section>
            <section data-testid="filter-control">
                <button type="button" onClick={() => setFilterOpen(!filterOpen)}>Toggle Filters</button>
                {filterOpen && <div className="relative rounded-lg border bg-card p-4">
                    <form onSubmit={(event) => {
                        event.preventDefault();
                        setSubmitted(String(new FormData(event.currentTarget).get('role') ?? 'missing'));
                    }}>
                        <h2>Filters</h2>
                        <SearchableSelect
                            label="Role"
                            name="role"
                            value={role}
                            options={ROLES}
                            onValueChange={setRole}
                        />
                        <button type="submit">Apply</button>
                    </form>
                </div>}
                <output data-testid="role-value">{role}</output>
                <output data-testid="submitted-role">{submitted}</output>
            </section>
            <section data-testid="field-control">
                <h2>Constraint picker</h2>
                <ConstraintPicker
                    value={field}
                    fields={[
                        { key: 'name', label: 'Name', kind: 'text' },
                        { key: 'quantity', label: 'Quantity', kind: 'number' },
                        { key: 'visibility', label: 'Visibility', kind: 'boolean' },
                    ]}
                    onValueChange={setField}
                />
                <output data-testid="field-value">{field}</output>
            </section>
            <section>
                <button type="button" onClick={() => setDialogOpen(true)}>Open dialog</button>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit fictional user</DialogTitle>
                            <DialogDescription>Test nested Base UI Combobox inside Radix Dialog.</DialogDescription>
                        </DialogHeader>
                        <div data-testid="dialog-control">
                            <SearchableSelect
                                label="User role"
                                value={dialogRole}
                                options={ROLES.slice(1)}
                                onValueChange={setDialogRole}
                            />
                            <output data-testid="dialog-value">{dialogRole}</output>
                        </div>
                    </DialogContent>
                </Dialog>
            </section>
            <section data-testid="native-table">
                <LavertiaTable node={sampleTable} />
            </section>
        </main>
    );
}

const target = document.getElementById('root');
if (target) createRoot(target).render(<Harness />);
