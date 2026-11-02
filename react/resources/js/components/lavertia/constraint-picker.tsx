import { useMemo } from 'react';
import { CalendarDays, CheckCircle2, Hash, Search, Type } from 'lucide-react';
import {
    Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput,
    ComboboxItem, ComboboxList, ComboboxTrigger, ComboboxValue,
} from '@/components/ui/combobox';
import type { FilterField, FilterKind } from './filter-query';

const icons: Record<FilterKind, typeof Type> = {
    text: Type, number: Hash, boolean: CheckCircle2, date: CalendarDays,
};

/** Two-column typed constraint chooser from the Filament reference UI. */
export function ConstraintPicker({ fields, value, onValueChange }: {
    fields: readonly FilterField[];
    value: string;
    onValueChange: (key: string) => void;
}) {
    const items = useMemo(() => [...fields], [fields]);
    const selected = items.find(item => item.key === value) ?? null;

    return <Combobox items={items} value={selected} autoHighlight
        isItemEqualToValue={(item: FilterField, current: FilterField) => item.key === current.key}
        itemToStringLabel={(item: FilterField) => item.label}
        onValueChange={(item: FilterField | null) => { if (item) onValueChange(item.key); }}>
        <ComboboxTrigger aria-label="Filter field"><ComboboxValue placeholder="Choose a field" /></ComboboxTrigger>
        <ComboboxContent className="min-w-[min(36rem,90vw)]">
            <div className="relative border-b border-border p-1.5">
                <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <ComboboxInput className="ps-9" aria-label="Search filter fields" placeholder="Search fields..." autoComplete="off" />
            </div>
            <ComboboxEmpty>No matching fields</ComboboxEmpty>
            <ComboboxList className="grid grid-cols-1 gap-0.5 p-1 sm:grid-cols-2">
                {(item: FilterField) => {
                    const Icon = icons[item.kind];
                    return <ComboboxItem key={item.key} value={item}>
                        <Icon className="me-2 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        <span className="min-w-0 truncate" title={item.label}>{item.label}</span>
                    </ComboboxItem>;
                }}
            </ComboboxList>
        </ComboboxContent>
    </Combobox>;
}
