import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import type { PanelAppearance } from '@/components/lavertia/types';

export default function AppLogo({ compact = false }: { compact?: boolean }) {
    const panel = usePage().props.lavertiaPanel as PanelAppearance | null | undefined;

    if (panel?.brandLogoDisplay === 'hidden') return null;

    const name = panel?.brandName ?? 'Lavertia';
    const subtitle = panel?.brandSubtitle ?? 'Playground';
    const showText = !compact && panel?.brandLogoDisplay !== 'icon';

    return (
        <>
            <div
                className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg shadow-sm ring-1 ring-black/5"
                style={{
                    backgroundColor: panel?.brandLogo ? 'transparent' : (panel?.primaryColor ?? '#f59e0b'),
                    color: panel?.primaryForeground ?? '#111827',
                }}
            >
                {panel?.brandLogo ? (
                    <img src={panel.brandLogo} alt={name} className="size-full object-contain" />
                ) : (
                    <AppLogoIcon className="size-6 fill-current" aria-hidden="true" />
                )}
            </div>
            {showText && (
                <div className="ms-2 grid min-w-0 flex-1 text-start group-data-[collapsible=icon]:hidden">
                    <span className="truncate text-sm font-semibold leading-tight">{name}</span>
                    {subtitle && <span className="truncate text-xs text-muted-foreground">{subtitle}</span>}
                </div>
            )}
        </>
    );
}
