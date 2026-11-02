/**
 * Browser-only table filtering expression.
 * Never turn client-provided keys/operators into raw SQL. The future Eloquent
 * implementation must use an authorized, server-owned field/operator registry.
 */
export type FilterKind = 'text' | 'number' | 'boolean' | 'date';
export type Junction = 'and' | 'or';
export type FilterOperator =
    | 'contains' | 'not_contains' | 'eq' | 'neq' | 'starts_with' | 'ends_with'
    | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'before' | 'after'
    | 'is_true' | 'is_false' | 'is_empty' | 'is_not_empty';

export interface FilterField {
    key: string;
    label: string;
    kind: FilterKind;
}
export interface FilterRule {
    type: 'rule';
    id: string;
    field: string;
    operator: FilterOperator;
    value: string;
    valueTo: string;
}
export interface FilterGroup {
    type: 'group';
    id: string;
    junction: Junction;
    children: FilterNode[];
}
export type FilterNode = FilterGroup | FilterRule;

export const operators: Record<FilterKind, ReadonlyArray<{ value: FilterOperator; label: string }>> = {
    text: [
        { value: 'contains', label: 'Contains' }, { value: 'not_contains', label: 'Does not contain' },
        { value: 'eq', label: 'Equals' }, { value: 'neq', label: 'Does not equal' },
        { value: 'starts_with', label: 'Starts with' }, { value: 'ends_with', label: 'Ends with' },
        { value: 'is_empty', label: 'Is empty' }, { value: 'is_not_empty', label: 'Is not empty' },
    ],
    number: [
        { value: 'eq', label: 'Equals' }, { value: 'neq', label: 'Does not equal' },
        { value: 'gt', label: 'Is greater than' }, { value: 'gte', label: 'Is at least' },
        { value: 'lt', label: 'Is less than' }, { value: 'lte', label: 'Is at most' },
        { value: 'between', label: 'Is between' }, { value: 'is_empty', label: 'Is empty' },
        { value: 'is_not_empty', label: 'Is not empty' },
    ],
    boolean: [
        { value: 'is_true', label: 'Is true' }, { value: 'is_false', label: 'Is false' },
        { value: 'is_empty', label: 'Is empty' }, { value: 'is_not_empty', label: 'Is not empty' },
    ],
    date: [
        { value: 'eq', label: 'On date' }, { value: 'before', label: 'Before' },
        { value: 'after', label: 'After' }, { value: 'between', label: 'Is between' },
        { value: 'is_empty', label: 'Is empty' }, { value: 'is_not_empty', label: 'Is not empty' },
    ],
};
export const MAX_GROUP_DEPTH = 3;
export const MAX_RULES = 24;
export const needsValue = (op: FilterOperator) => !['is_empty', 'is_not_empty', 'is_true', 'is_false'].includes(op);
export const fieldOperator = (field: FilterField): FilterOperator => operators[field.kind][0].value;
export function createRule(field: FilterField, id: string): FilterRule {
    return { type: 'rule', id, field: field.key, operator: fieldOperator(field), value: '', valueTo: '' };
}
export function countRules(group: FilterGroup): number {
    return group.children.reduce((n, child) => n + (child.type === 'rule' ? 1 : countRules(child)), 0);
}
function validDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + 'T00:00:00Z');
    return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}
export function validateQuery(group: FilterGroup, fields: readonly FilterField[]): string[] {
    const problems: string[] = [];
    const ids = new Set<string>();
    function inspect(node: FilterNode, depth: number) {
        if (!node.id || ids.has(node.id)) problems.push('Rules must have unique IDs.');
        ids.add(node.id);
        if (node.type === 'group') {
            if (depth > MAX_GROUP_DEPTH) problems.push('Too many nested groups.');
            if (depth > 1 && node.children.length === 0) problems.push('A nested group cannot be empty.');
            node.children.forEach(child => inspect(child, depth + 1));
            return;
        }
        const field = fields.find(item => item.key === node.field);
        if (!field) { problems.push('Unknown filter field.'); return; }
        if (!operators[field.kind].some(option => option.value === node.operator)) {
            problems.push('Invalid comparison for ' + field.label + '.'); return;
        }
        if (needsValue(node.operator)) {
            if (!node.value.trim()) problems.push(field.label + ' requires a value.');
            if (node.operator === 'between' && !node.valueTo.trim()) problems.push(field.label + ' requires an upper value.');
            if (field.kind === 'number' &&
                (node.value.trim() && !Number.isFinite(Number(node.value)) ||
                node.operator === 'between' && node.valueTo.trim() && !Number.isFinite(Number(node.valueTo)))) {
                problems.push(field.label + ' must be a number.');
            }
            if (field.kind === 'date' &&
                (node.value.trim() && !validDate(node.value) ||
                node.operator === 'between' && node.valueTo.trim() && !validDate(node.valueTo))) {
                problems.push(field.label + ' must be a date.');
            }
        }
    }
    inspect(group, 1);
    if (countRules(group) > MAX_RULES) problems.push('Too many filter rules.');
    return [...new Set(problems)];
}
export function evaluateQuery<T extends object>(record: T, root: FilterGroup, fields: readonly FilterField[]): boolean {
    if (root.children.length === 0) return true;
    const row = record as Record<string, unknown>;
    const evaluate = (node: FilterNode): boolean => {
        if (node.type === 'group') {
            if (node.children.length === 0) return true;
            return node.junction === 'and' ? node.children.every(evaluate) : node.children.some(evaluate);
        }
        const field = fields.find(item => item.key === node.field);
        if (!field || !operators[field.kind].some(op => op.value === node.operator)) return false;
        const actual = row[node.field];
        if (node.operator === 'is_empty') return actual == null || actual === '';
        if (node.operator === 'is_not_empty') return actual != null && actual !== '';
        if (node.operator === 'is_true') return actual === true;
        if (node.operator === 'is_false') return actual === false;
        if (actual == null) return false;
        if (field.kind === 'text') {
            const left = String(actual).toLocaleLowerCase();
            const right = node.value.toLocaleLowerCase();
            if (!right.trim()) return false;
            switch (node.operator) {
                case 'contains': return left.includes(right);
                case 'not_contains': return !left.includes(right);
                case 'eq': return left === right;
                case 'neq': return left !== right;
                case 'starts_with': return left.startsWith(right);
                case 'ends_with': return left.endsWith(right);
                default: return false;
            }
        }
        if (field.kind === 'number') {
            const left = typeof actual === 'number' ? actual : Number(actual);
            const right = Number(node.value);
            const upper = Number(node.valueTo);
            if (!Number.isFinite(left) || !node.value.trim() || !Number.isFinite(right)) return false;
            switch (node.operator) {
                case 'eq': return left === right;
                case 'neq': return left !== right;
                case 'gt': return left > right;
                case 'gte': return left >= right;
                case 'lt': return left < right;
                case 'lte': return left <= right;
                case 'between': return !!node.valueTo.trim() && Number.isFinite(upper) && left >= right && left <= upper;
                default: return false;
            }
        }
        if (field.kind === 'date') {
            const left = String(actual).slice(0, 10);
            if (!validDate(left) || !validDate(node.value)) return false;
            switch (node.operator) {
                case 'eq': return left === node.value;
                case 'before': return left < node.value;
                case 'after': return left > node.value;
                case 'between': return validDate(node.valueTo) && left >= node.value && left <= node.valueTo;
                default: return false;
            }
        }
        return false;
    };
    return evaluate(root);
}
