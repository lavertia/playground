import { usePage } from '@inertiajs/react';
import type { PanelAppearance } from '@/components/lavertia/types';

export default function AppLogo() {
    const panel = usePage().props.lavertiaPanel as PanelAppearance | null | undefined;
    const name = panel?.brandName ?? 'Lavertia';
    const subtitle = panel?.brandSubtitle ?? 'Playground';

    return (
        <>
            <div
                className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg text-base font-black shadow-sm ring-1 ring-black/10"
                style={{ backgroundColor: panel?.primaryColor ?? '#f59e0b', color: panel?.primaryForeground ?? '#111827' }}
            >
                {panel?.brandLogo ? (
                    <img src={panel.brandLogo} alt="" className="size-full object-contain" />
                ) : name.charAt(0).toLocaleUpperCase()}
            </div>
            <div className="ms-1 grid min-w-0 flex-1 text-start">
                <span className="truncate text-sm font-bold leading-tight">{name}</span>
                {subtitle && (
                    <span className="truncate text-[10px] font-medium text-muted-foreground">{subtitle}</span>
                )}
            </div>
        </>
    );
}
