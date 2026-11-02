import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { CalendarDays, CheckCircle2, Copy, Filter, Hash, Plus, RotateCcw, Trash2, Type } from 'lucide-react';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { cn } from '@/lib/utils';
import {
    countRules, createRule, fieldOperator, MAX_GROUP_DEPTH, MAX_RULES, needsValue,
    operators, validateQuery,
} from './filter-query';
import type { FilterField, FilterGroup, FilterKind, FilterNode, FilterOperator, FilterRule, Junction } from './filter-query';

let nextLocalId = 0;
const nextId = () => 'filter-' + Date.now().toString(36) + '-' + (++nextLocalId).toString(36);
const action = 'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-40 disabled:pointer-events-none';
const iconAction = 'inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-40 disabled:pointer-events-none';

function replaceNode(group: FilterGroup, id: string, transform: (node: FilterNode) => FilterNode): FilterGroup {
    if (group.id === id) return transform(group) as FilterGroup;
    return {
        ...group,
        children: group.children.map(child => {
            if (child.id === id) return transform(child);
            return child.type === 'group' ? replaceNode(child, id, transform) : child;
        }),
    };
}
function removeNode(group: FilterGroup, id: string): FilterGroup {
    return { ...group, children: group.children.filter(x => x.id !== id).map(x => x.type === 'group' ? removeNode(x, id) : x) };
}
function cloneNode(node: FilterNode): FilterNode {
    if (node.type === 'rule') return { ...node, id: nextId() };
    return { ...node, id: nextId(), children: node.children.map(cloneNode) };
}
function appendToGroup(group: FilterGroup, id: string, child: FilterNode): FilterGroup {
    return replaceNode(group, id, node => node.type === 'group' ? { ...node, children: [...node.children, child] } : node);
}
function duplicateNode(group: FilterGroup, id: string): FilterGroup {
    return {
        ...group,
        children: group.children.flatMap(child => {
            if (child.id === id) return [child, cloneNode(child)];
            return [child.type === 'group' ? duplicateNode(child, id) : child];
        }),
    };
}

const icons: Record<FilterKind, typeof Type> = {
    text: Type, number: Hash, boolean: CheckCircle2, date: CalendarDays,
};

interface EditorProps {
    value: FilterGroup;
    fields: readonly FilterField[];
    onChange: (group: FilterGroup) => void;
    onApply: () => void;
    onReset: () => void;
    onClose?: () => void;
}

export function QueryBuilderEditor({ value, fields, onChange, onApply, onReset, onClose }: EditorProps) {
    const problems = useMemo(() => validateQuery(value, fields), [value, fields]);
    const totalRules = countRules(value);
    const canAdd = totalRules < MAX_RULES;

    function setRule(id: string, change: Partial<FilterRule>) {
        onChange(replaceNode(value, id, node => node.type === 'rule' ? { ...node, ...change } : node));
    }
    function addRule(groupId: string) {
        if (!canAdd || !fields[0]) return;
        onChange(appendToGroup(value, groupId, createRule(fields[0], nextId())));
    }
    function addGroup(groupId: string, junction: Junction) {
        if (!canAdd || !fields[0]) return;
        onChange(appendToGroup(value, groupId, {
            type: 'group', id: nextId(), junction, children: [createRule(fields[0], nextId())],
        }));
    }
    function renderRule(rule: FilterRule) {
        const chosen = fields.find(x => x.key === rule.field) ?? fields[0];
        if (!chosen) return null;
        const FieldIcon = icons[chosen.kind];
        const candidates = operators[chosen.kind].map(x => ({ value: x.value, label: x.label }));
        const type = chosen.kind === 'number' ? 'number' : chosen.kind === 'date' ? 'date' : 'text';
        const needsInput = needsValue(rule.operator);
        return <div key={rule.id} className="grid min-w-0 gap-2 rounded-lg border border-border/70 bg-background/65 p-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.4fr)_auto] md:items-end">
            <div className="min-w-0 space-y-1.5">
                <span className="flex items-center gap-1.5 text-xs font-medium"><FieldIcon className="size-3.5 text-muted-foreground" /> Field</span>
                <SearchableSelect label="Filter field" className="w-full" value={chosen.key}
                    options={fields.map(x => ({ value: x.key, label: x.label }))}
                    onValueChange={field => {
                        const next = fields.find(x => x.key === field);
                        if (next) setRule(rule.id, { field, operator: fieldOperator(next), value: '', valueTo: '' });
                    }} />
            </div>
            <div className="min-w-0 space-y-1.5">
                <span className="block text-xs font-medium">Comparison</span>
                <SearchableSelect label={'Comparison for ' + chosen.label} value={rule.operator} className="w-full"
                    options={candidates} onValueChange={operator => setRule(rule.id, { operator: operator as FilterOperator, value: '', valueTo: '' })} />
            </div>
            <div className="min-w-0 space-y-1.5">
                <span className="block text-xs font-medium">{needsInput ? 'Value' : 'Value not required'}</span>
                {needsInput ? <div className="flex min-w-0 gap-2">
                    <input aria-label={chosen.label + ' filter value'} type={type} value={rule.value}
                        onChange={e => setRule(rule.id, { value: e.target.value })}
                        placeholder={type === 'text' ? 'Enter text' : type === 'number' ? '0' : undefined}
                        className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40" />
                    {rule.operator === 'between' && <input aria-label={chosen.label + ' filter upper value'} type={type} value={rule.valueTo}
                        onChange={e => setRule(rule.id, { valueTo: e.target.value })}
                        placeholder="To" className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40" />}
                </div> : <div className="flex h-9 items-center text-xs text-muted-foreground">No input</div>}
            </div>
            <div className="flex items-center justify-end gap-1 md:justify-start">
                <button type="button" title="Duplicate rule" aria-label="Duplicate rule" className={iconAction}
                    disabled={!canAdd} onClick={() => onChange(duplicateNode(value, rule.id))}><Copy className="size-4" /></button>
                <button type="button" title="Delete rule" aria-label="Delete rule" className={cn(iconAction, 'text-rose-600 dark:text-rose-400')}
                    onClick={() => onChange(removeNode(value, rule.id))}><Trash2 className="size-4" /></button>
            </div>
        </div>;
    }

    function renderGroup(group: FilterGroup, depth: number): ReactNode {
        return <div key={group.id} className={cn('space-y-3 rounded-xl', depth === 1 ? '' : 'border border-border bg-muted/30 p-3 sm:p-4')}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <span>{depth === 1 ? 'Match rules' : 'Nested group'}</span>
                    <SearchableSelect label="Group operator" size="sm" className="w-40" value={group.junction}
                        options={[{ value: 'and', label: 'All (AND)' }, { value: 'or', label: 'Any (OR)' }]}
                        onValueChange={junction => onChange(replaceNode(value, group.id, node => ({ ...node, junction: junction as Junction }) as FilterGroup))} />
                </div>
                {depth > 1 && <div className="flex gap-1">
                    <button type="button" className={iconAction} aria-label="Duplicate group" title="Duplicate group"
                        disabled={totalRules + countRules(group) > MAX_RULES} onClick={() => onChange(duplicateNode(value, group.id))}><Copy className="size-4" /></button>
                    <button type="button" className={cn(iconAction, 'text-rose-600 dark:text-rose-400')} aria-label="Remove group" title="Remove group"
                        onClick={() => onChange(removeNode(value, group.id))}><Trash2 className="size-4" /></button>
                </div>}
            </div>
            {group.children.length === 0 && <div className="rounded-lg border border-dashed border-border p-5 text-center text-sm text-muted-foreground">No rules yet. Add a rule to build your filter.</div>}
            {group.children.map((node, index) => <div key={node.id} className="space-y-3">
                {index > 0 && <div className="flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" /><span>{group.junction.toUpperCase()}</span><div className="h-px flex-1 bg-border" /></div>}
                {node.type === 'rule' ? renderRule(node) : renderGroup(node, depth + 1)}
            </div>)}
            <div className="flex flex-wrap gap-2 pt-1">
                <button type="button" className={action} disabled={!canAdd} onClick={() => addRule(group.id)}><Plus className="size-4" />Add rule</button>
                {depth < MAX_GROUP_DEPTH && <>
                    <button type="button" className={action} disabled={!canAdd} onClick={() => addGroup(group.id, 'and')}><Plus className="size-4" />AND group</button>
                    <button type="button" className={action} disabled={!canAdd} onClick={() => addGroup(group.id, 'or')}><Plus className="size-4" />OR group</button>
                </>}
            </div>
        </div>;
    }
    return <section aria-label="Advanced Query Builder" className="space-y-4 border-b border-border bg-card px-4 py-5 sm:px-6">
        <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5"><h3 className="flex items-center gap-2 text-sm font-semibold"><Filter className="size-4" />Advanced filters</h3><p className="text-xs text-muted-foreground">Combine rules and nested AND/OR groups. Changes apply only after you confirm.</p></div>
            <button type="button" className="text-sm font-medium text-rose-500 hover:underline" onClick={onReset}><RotateCcw className="me-1 inline size-3.5" />Reset</button>
        </div>
        {renderGroup(value, 1)}
        {problems.length > 0 && <div role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">{problems.join(' ')}</div>}
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">{totalRules} of {MAX_RULES} rules · maximum {MAX_GROUP_DEPTH} group levels</div>
            <div className="flex flex-wrap items-center gap-2">
                {onClose && <button type="button" className={action} onClick={onClose}>Close</button>}
                <button type="button" disabled={problems.length > 0} onClick={onApply}
                    className="inline-flex min-h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40">Apply filters</button>
            </div>
        </div>
    </section>;
}
