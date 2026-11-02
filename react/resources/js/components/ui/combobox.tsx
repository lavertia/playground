import * as React from 'react';
import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * shadcn/ui Base UI Combobox primitives, adapted to Playground design tokens.
 * https://ui.shadcn.com/docs/components/base/combobox
 */
const Combobox = ComboboxPrimitive.Root;

function ComboboxValue(props: ComboboxPrimitive.Value.Props) {
    return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />;
}

function ComboboxTrigger({
    className,
    size = 'default',
    children,
    ...props
}: ComboboxPrimitive.Trigger.Props & { size?: 'sm' | 'default' }) {
    return (
        <ComboboxPrimitive.Trigger
            data-slot="combobox-trigger"
            data-size={size}
            className={cn(
                'flex w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs transition-[border-color,box-shadow,background-color] outline-none',
                'hover:bg-accent/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-popup-open:border-ring data-popup-open:ring-[3px] data-popup-open:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50',
                'data-[size=default]:h-9 data-[size=sm]:h-8 [&_[data-slot=combobox-value]]:truncate',
                className,
            )}
            {...props}
        >
            <span className="min-w-0 flex-1 truncate text-start">{children}</span>
            <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </ComboboxPrimitive.Trigger>
    );
}

function ComboboxInput({
    className,
    ...props
}: ComboboxPrimitive.Input.Props) {
    return (
        <ComboboxPrimitive.Input
            data-slot="combobox-input"
            className={cn(
                'h-9 w-full min-w-0 rounded-md bg-transparent px-3 text-sm text-popover-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-0',
                className,
            )}
            {...props}
        />
    );
}

function ComboboxContent({
    className,
    children,
    container,
    side = 'bottom',
    sideOffset = 4,
    align = 'start',
    ...props
}: ComboboxPrimitive.Popup.Props &
    Pick<ComboboxPrimitive.Positioner.Props, 'side' | 'sideOffset' | 'align'> & {
        container?: ComboboxPrimitive.Portal.Props['container'];
    }) {
    return (
        <ComboboxPrimitive.Portal container={container}>
            <ComboboxPrimitive.Positioner
                side={side}
                sideOffset={sideOffset}
                align={align}
                className="isolate z-[100]"
            >
                <ComboboxPrimitive.Popup
                    data-slot="combobox-content"
                    className={cn(
                        'relative max-h-[min(22rem,var(--available-height))] min-w-[max(12rem,var(--anchor-width))] max-w-[var(--available-width)] origin-[var(--transform-origin)] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl outline-none',
                        'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
                        className,
                    )}
                    {...props}
                >
                    {children}
                </ComboboxPrimitive.Popup>
            </ComboboxPrimitive.Positioner>
        </ComboboxPrimitive.Portal>
    );
}

function ComboboxList({
    className,
    ...props
}: ComboboxPrimitive.List.Props) {
    return (
        <ComboboxPrimitive.List
            data-slot="combobox-list"
            className={cn('max-h-64 scroll-py-1 overflow-y-auto overscroll-contain p-1', className)}
            {...props}
        />
    );
}

function ComboboxItem({
    className,
    children,
    ...props
}: ComboboxPrimitive.Item.Props) {
    return (
        <ComboboxPrimitive.Item
            data-slot="combobox-item"
            className={cn(
                'relative flex min-h-9 w-full cursor-default items-center rounded-md py-2 pe-8 ps-2.5 text-sm outline-none select-none',
                'data-highlighted:bg-accent data-highlighted:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                className,
            )}
            {...props}
        >
            <span className="min-w-0 flex-1 truncate">{children}</span>
            <ComboboxPrimitive.ItemIndicator
                data-slot="combobox-item-indicator"
                className="pointer-events-none absolute end-2 inline-flex size-4 items-center justify-center text-primary"
            >
                <CheckIcon className="size-4" aria-hidden="true" />
            </ComboboxPrimitive.ItemIndicator>
        </ComboboxPrimitive.Item>
    );
}

function ComboboxEmpty({
    className,
    ...props
}: ComboboxPrimitive.Empty.Props) {
    return (
        <ComboboxPrimitive.Empty
            data-slot="combobox-empty"
            className={cn('px-3 py-6 text-center text-sm text-muted-foreground', className)}
            {...props}
        />
    );
}

export {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxTrigger,
    ComboboxValue,
};
