import { router, usePage } from '@inertiajs/react';
import { localeLabel, localeUrl } from '@/components/lavertia/types';
import type { PanelAppearance } from '@/components/lavertia/types';

export function PanelLocaleSwitcher() {
    const page = usePage();
    const panel = page.props.lavertiaPanel as PanelAppearance | null | undefined;

    if (!panel?.languageSwitcher || (panel.supportedLocales?.length ?? 0) < 2) {
        return null;
    }

    return (
        <label className="inline-flex items-center gap-2">
            <span className="sr-only">Language</span>
            <select
                aria-label="Language"
                className="h-9 min-w-24 max-w-44 rounded-md border border-border bg-background px-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                value={panel.locale}
                onChange={event => router.visit(localeUrl(page.url, event.target.value), { preserveScroll: true })}
            >
                {panel.supportedLocales.map(code => (
                    <option key={code} value={code}>{localeLabel(code, panel.locale ?? 'en')}</option>
                ))}
            </select>
        </label>
    );
}
