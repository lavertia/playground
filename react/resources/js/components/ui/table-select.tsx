import * as React from 'react';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

/**
 * Thin scalar-value adapter using the installed shadcn/Base UI Select primitives.
 *
 * Fixed short choices should use Select, not a searchable Combobox. Long lists
 * use SearchableSelect, which composes the original Base UI Combobox primitives.
 */
export interface TableSelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface TableSelectProps {
    label: string;
    value: string;
    options: readonly TableSelectOption[];
    onValueChange: (value: string) => void;
    className?: string;
    size?: 'sm' | 'default';
    disabled?: boolean;
    placeholder?: string;
}

export function TableSelect({
    label,
    value,
    options,
    onValueChange,
    className,
    size = 'default',
    disabled = false,
    placeholder,
}: TableSelectProps) {
    const items = React.useMemo(() => [...options], [options]);

    return (
        <Select
            items={items}
            value={value}
            disabled={disabled}
            onValueChange={(next) => {
                if (typeof next === 'string') {
                    onValueChange(next);
                }
            }}
        >
            <SelectTrigger
                type="button"
                size={size}
                aria-label={label}
                className={cn('w-full min-w-0', className)}
            >
                <SelectValue placeholder={placeholder ?? 'Choose an option'} />
            </SelectTrigger>
            <SelectContent side="bottom" align="start" alignItemWithTrigger={false}>
                <SelectGroup>
                    {items.map((option) => (
                        <SelectItem
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
