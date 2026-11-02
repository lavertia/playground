import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
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
 * Accessible searchable Select for filters, grouping and small form fields.
 * Uses the existing design tokens, without a new UI dependency.
 */
export function SearchableSelect({
    label, value, options, onValueChange,
    placeholder = 'Select an option',
    searchPlaceholder = 'Search options...',
    emptyMessage = 'No matching options',
    className, size = 'default', disabled = false,
}: SearchableSelectProps) {
    const id = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(0);
    const [above, setAbove] = useState(false);

    const filtered = useMemo(() => {
        const clean = (text: string) => text.normalize('NFKD')
            .replace(/[\u0300-\u036f\u064B-\u065F]/g, '')
            .toLocaleLowerCase();
        const search = clean(query.trim());
        return options.filter((option) => clean(option.label).includes(search));
    }, [options, query]);

    const selected = options.find((option) => option.value === value);
    const listId = id + '-listbox';

    useEffect(() => {
        if (!open) return;

        const place = () => {
            const rect = triggerRef.current?.getBoundingClientRect();
            if (rect) setAbove(window.innerHeight - rect.bottom < 230 && rect.top > window.innerHeight - rect.bottom);
        };
        place();
        window.addEventListener('resize', place);
        window.addEventListener('scroll', place, true);

        function onOutside(event: PointerEvent) {
            if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
        }
        document.addEventListener('pointerdown', onOutside);

        searchRef.current?.focus({ preventScroll: true });

        return () => {
            document.removeEventListener('pointerdown', onOutside);
            window.removeEventListener('resize', place);
            window.removeEventListener('scroll', place, true);
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        listRef.current?.querySelector<HTMLElement>('[data-active="true"]')
            ?.scrollIntoView({ block: 'nearest' });
    }, [active, open, query]);

    const openSelect = () => {
        if (disabled) return;
        setQuery('');
        setActive(Math.max(0, options.findIndex((option) => option.value === value && !option.disabled)));
        setOpen(true);
    };

    const choose = (option: SearchableOption) => {
        if (option.disabled) return;
        onValueChange(option.value);
        setOpen(false);
        triggerRef.current?.focus({ preventScroll: true });
    };

    function move(step: number) {
        if (!filtered.some((option) => !option.disabled)) return;
        let index = active;
        for (let i = 0; i < filtered.length; i++) {
            index = (index + step + filtered.length) % filtered.length;
            if (!filtered[index].disabled) {
                setActive(index);
                return;
            }
        }
    }

    function keyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            move(event.key === 'ArrowDown' ? 1 : -1);
        } else if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            const indexes = filtered.flatMap((option, index) => option.disabled ? [] : [index]);
            const next = event.key === 'Home' ? indexes[0] : indexes[indexes.length - 1];
            if (next !== undefined) setActive(next);
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (filtered[active]) choose(filtered[active]);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            setOpen(false);
            triggerRef.current?.focus({ preventScroll: true });
        } else if (event.key === 'Tab') {
            setOpen(false);
        }
    }

    return <div ref={rootRef} className={cn('relative min-w-0', className)}>
        <button type="button" ref={triggerRef} disabled={disabled}
            aria-label={label} aria-haspopup="listbox" aria-expanded={open}
            aria-controls={open ? listId : undefined}
            onClick={() => open ? setOpen(false) : openSelect()}
            onKeyDown={(event) => {
                if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
                    event.preventDefault();
                    openSelect();
                }
            }}
            className={cn(
                'flex w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs',
                'transition-[border-color,box-shadow,background-color] hover:bg-accent/30 focus-visible:border-amber-500 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-amber-500/20',
                'disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30',
                open && 'border-amber-500 ring-[3px] ring-amber-500/15',
                size === 'sm' ? 'h-8' : 'h-9',
            )}>
            <span className={cn('min-w-0 truncate text-start', !selected && 'text-muted-foreground')}>
                {selected?.label ?? placeholder}
            </span>
            <ChevronDown aria-hidden="true" className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
        </button>
        {open && <div className={cn(
            'absolute start-0 z-[70] flex w-full min-w-44 max-w-[min(22rem,90vw)] flex-col overflow-hidden rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl',
            above ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
        )}>
            <div className="relative border-b border-border pb-1.5">
                <Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-[65%] text-muted-foreground" />
                <input ref={searchRef} type="search" role="combobox"
                    aria-label={'Search ' + label} aria-autocomplete="list" aria-expanded="true"
                    aria-controls={listId}
                    aria-activedescendant={filtered[active] ? id + '-option-' + active : undefined}
                    placeholder={searchPlaceholder} value={query}
                    onChange={(event) => { setQuery(event.target.value); setActive(0); }}
                    onKeyDown={keyDown}
                    className="h-9 w-full rounded-md bg-transparent ps-9 pe-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
            </div>
            <div ref={listRef} id={listId} role="listbox" aria-label={label}
                className="min-h-0 max-h-56 overflow-y-auto overscroll-contain p-1">
                {filtered.length === 0
                    ? <p role="status" className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>
                    : filtered.map((option, index) => <button key={option.value}
                        id={id + '-option-' + index} type="button" role="option" tabIndex={-1}
                        aria-selected={option.value === value} data-active={active === index ? 'true' : undefined}
                        disabled={option.disabled}
                        onMouseMove={() => { if (!option.disabled) setActive(index); }}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => choose(option)}
                        className={cn(
                            'flex min-h-9 w-full items-center justify-between gap-3 rounded-md px-2.5 py-2 text-start text-sm outline-none',
                            'disabled:cursor-not-allowed disabled:opacity-40',
                            active === index && 'bg-accent text-accent-foreground',
                            option.value === value && 'font-semibold text-amber-700 dark:text-amber-400',
                        )}>
                        <span className="min-w-0 truncate">{option.label}</span>
                        {option.value === value && <Check aria-hidden="true" className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />}
                    </button>)}
            </div>
        </div>}
    </div>;
}
