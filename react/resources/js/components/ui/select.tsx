import { Select as SelectPrimitive } from '@base-ui/react/select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * shadcn/ui Base UI Select primitives. Use Combobox for searchable choices.
 * https://ui.shadcn.com/docs/components/base/select
 */
const Select = SelectPrimitive.Root;

function SelectGroup(props: SelectPrimitive.Group.Props) {
    return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
    className,
    ...props
}: SelectPrimitive.Value.Props) {
    return (
        <SelectPrimitive.Value
            data-slot="select-value"
            className={cn('min-w-0 truncate', className)}
            {...props}
        />
    );
}

function SelectTrigger({
    className,
    size = 'default',
    children,
    ...props
}: SelectPrimitive.Trigger.Props & { size?: 'sm' | 'default' }) {
    return (
        <SelectPrimitive.Trigger
            data-slot="select-trigger"
            data-size={size}
            className={cn(
                'flex w-fit min-w-0 items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs transition-[border-color,box-shadow,background-color] outline-none',
                'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50',
                'data-[size=default]:h-9 data-[size=sm]:h-8 [&_svg]:pointer-events-none [&_svg]:shrink-0',
                className,
            )}
            {...props}
        >
            {children}
            <SelectPrimitive.Icon render={<ChevronDownIcon className="size-4 text-muted-foreground" />} />
        </SelectPrimitive.Trigger>
    );
}

function SelectContent({
    className,
    children,
    container,
    align = 'start',
    side = 'bottom',
    sideOffset = 4,
    alignItemWithTrigger = false,
    ...props
}: SelectPrimitive.Popup.Props &
    Pick<SelectPrimitive.Positioner.Props, 'align' | 'side' | 'sideOffset' | 'alignItemWithTrigger'> & {
        container?: SelectPrimitive.Portal.Props['container'];
    }) {
    return (
        <SelectPrimitive.Portal container={container}>
            <SelectPrimitive.Positioner
                className="isolate z-[100]"
                align={align}
                side={side}
                sideOffset={sideOffset}
                alignItemWithTrigger={alignItemWithTrigger}
            >
                <SelectPrimitive.Popup
                    data-slot="select-content"
                    className={cn(
                        'relative max-h-[var(--available-height)] min-w-[max(10rem,var(--anchor-width))] origin-[var(--transform-origin)] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl',
                        'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
                        className,
                    )}
                    {...props}
                >
                    <SelectScrollUpButton />
                    <SelectPrimitive.List className="p-1">{children}</SelectPrimitive.List>
                    <SelectScrollDownButton />
                </SelectPrimitive.Popup>
            </SelectPrimitive.Positioner>
        </SelectPrimitive.Portal>
    );
}

function SelectLabel({
    className,
    ...props
}: SelectPrimitive.GroupLabel.Props) {
    return (
        <SelectPrimitive.GroupLabel
            data-slot="select-label"
            className={cn('px-2 py-1.5 text-xs text-muted-foreground', className)}
            {...props}
        />
    );
}

function SelectItem({
    className,
    children,
    ...props
}: SelectPrimitive.Item.Props) {
    return (
        <SelectPrimitive.Item
            data-slot="select-item"
            className={cn(
                'relative flex min-h-9 w-full cursor-default items-center rounded-md py-2 pe-8 ps-2.5 text-sm outline-none select-none',
                'data-highlighted:bg-accent data-highlighted:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                className,
            )}
            {...props}
        >
            <SelectPrimitive.ItemText className="min-w-0 truncate">{children}</SelectPrimitive.ItemText>
            <SelectPrimitive.ItemIndicator
                className="pointer-events-none absolute end-2 inline-flex size-4 items-center justify-center text-primary"
            >
                <CheckIcon className="size-4" aria-hidden="true" />
            </SelectPrimitive.ItemIndicator>
        </SelectPrimitive.Item>
    );
}

function SelectSeparator({
    className,
    ...props
}: SelectPrimitive.Separator.Props) {
    return (
        <SelectPrimitive.Separator
            data-slot="select-separator"
            className={cn('pointer-events-none -mx-1 my-1 h-px bg-border', className)}
            {...props}
        />
    );
}

function SelectScrollUpButton({
    className,
    ...props
}: SelectPrimitive.ScrollUpArrow.Props) {
    return (
        <SelectPrimitive.ScrollUpArrow
            data-slot="select-scroll-up-button"
            className={cn('flex w-full items-center justify-center py-1 text-muted-foreground', className)}
            {...props}
        >
            <ChevronUpIcon className="size-4" />
        </SelectPrimitive.ScrollUpArrow>
    );
}

function SelectScrollDownButton({
    className,
    ...props
}: SelectPrimitive.ScrollDownArrow.Props) {
    return (
        <SelectPrimitive.ScrollDownArrow
            data-slot="select-scroll-down-button"
            className={cn('flex w-full items-center justify-center py-1 text-muted-foreground', className)}
            {...props}
        >
            <ChevronDownIcon className="size-4" />
        </SelectPrimitive.ScrollDownArrow>
    );
}

export {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
};
