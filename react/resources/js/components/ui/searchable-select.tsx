import * as React from 'react';
import { SearchIcon } from 'lucide-react';

import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxTrigger,
    ComboboxValue,
} from '@/components/ui/combobox';
import { cn } from '@/lib/utils';

export interface SearchableOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SearchableSelectProps {
    label: string;
    value: string;
    options: readonly SearchableOption[];
    onValueChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    className?: string;
    size?: 'sm' | 'default';
    disabled?: boolean;
}

/**
 * Thin convenience adapter around shadcn/ui's Base UI Combobox.
 *
 * Base UI owns keyboard handling, accessible selection, filtering, popover
 * placement and focus management. This adapter only maps the existing
 * Laravel/Inertia scalar value contract to { value, label } options.
 */
export function SearchableSelect({
    label,
    value,
    options,
    onValueChange,
    placeholder = 'Select an option',
    searchPlaceholder = 'Search options...',
    emptyMessage = 'No matching options',
    className,
    size = 'default',
    disabled = false,
}: SearchableSelectProps) {
    const triggerRootRef = React.useRef<HTMLDivElement>(null);
    const [dialogContainer, setDialogContainer] = React.useState<HTMLElement | null>(null);

    const items = React.useMemo(() => [...options], [options]);
    const current = items.find((item) => item.value === value) ?? null;

    return (
        <Combobox
            items={items}
            value={current}
            isItemEqualToValue={(item, selected) => item.value === selected.value}
            onValueChange={(item) => {
                if (item && !item.disabled) onValueChange(item.value);
            }}
            onOpenChange={(open) => {
                if (open) {
                    // Keep the popup inside the existing Radix modal focus trap.
                    setDialogContainer(triggerRootRef.current?.closest('[data-slot="dialog-content"]') ?? null);
                }
            }}
            autoHighlight
        >
            <div ref={triggerRootRef} className={cn('min-w-0', className)}>
                <ComboboxTrigger
                    aria-label={label}
                    disabled={disabled}
                    size={size}
                >
                    <ComboboxValue placeholder={placeholder} />
                </ComboboxTrigger>
            </div>

            <ComboboxContent
                aria-label={label}
                container={dialogContainer}
            >
                <div className="relative border-b border-border p-1.5">
                    <SearchIcon
                        aria-hidden="true"
                        className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <ComboboxInput
                        aria-label={'Search ' + label}
                        autoComplete="off"
                        placeholder={searchPlaceholder}
                        className="ps-9"
                    />
                </div>
                <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
                <ComboboxList>
                    {(item: SearchableOption) => (
                        <ComboboxItem
                            key={item.value}
                            value={item}
                            disabled={item.disabled}
                        >
                            {item.label}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}
