import { router, usePage } from '@inertiajs/react';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { localeLabel, localeUrl } from '@/components/lavertia/types';
import type { PanelAppearance } from '@/components/lavertia/types';

export function PanelLocaleSwitcher() {
    const page = usePage();
    const panel = page.props.lavertiaPanel as PanelAppearance | null | undefined;

    if (!panel?.languageSwitcher || (panel.supportedLocales?.length ?? 0) < 2) {
        return null;
    }

    return (
        <SearchableSelect
            label="Language"
            value={panel.locale ?? 'en'}
            options={(panel.supportedLocales ?? []).map((code) => ({
                value: code,
                label: localeLabel(code, panel.locale ?? 'en'),
            }))}
            onValueChange={(locale) => {
                if (locale !== panel.locale) {
                    router.visit(localeUrl(page.url, locale), {
                        preserveScroll: true,
                        preserveState: false,
                    });
                }
            }}
            className="w-36 max-w-44"
            size="sm"
            searchPlaceholder="Search languages..."
        />
    );
}
