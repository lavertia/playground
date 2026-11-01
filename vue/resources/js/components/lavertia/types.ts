export type Scalar = string | number | boolean | null;

export interface ComponentNode {
    type: string;
    key: string;
    props: Record<string, unknown>;
    components: ComponentNode[];
}

export interface NavigationLink {
    label: string;
    slug: string;
    group: string | null;
    url: string;
    active: boolean;
    icon?: string | null;
    badge?: string | null;
    parentSlug?: string | null;
    descendantActive?: boolean;
}

export interface NavigationGroupConfig {
    label: string;
    collapsible: boolean;
    collapsedByDefault: boolean;
    sort: number;
}

export interface NavigationGroupView extends NavigationGroupConfig {
    items: NavigationLink[];
    active: boolean;
}

export function panelNavigationGroups(
    links: NavigationLink[],
    config: NavigationGroupConfig[] = [],
): NavigationGroupView[] {
    const groups: NavigationGroupView[] = [];
    for (const link of links) {
        const label = link.group || 'Lavertia';
        let group = groups.find(item => item.label === label);
        if (!group) {
            const options = config.find(item => item.label === label);
            group = {
                label,
                collapsible: options?.collapsible ?? false,
                collapsedByDefault: options?.collapsedByDefault ?? false,
                sort: options?.sort ?? 0,
                active: false,
                items: [],
            };
            groups.push(group);
        }
        group.items.push(link);
        group.active ||= link.active || link.descendantActive === true;
    }
    return groups;
}

export interface HeaderLink {
    label: string;
    url: string | null;
    active: boolean;
}

export interface PanelMenuLink {
    label: string;
    url: string;
    external: boolean;
}

export interface ThemeManifest {
    id: string;
    tokens: Record<string, string>;
}

const THEME_TOKENS = new Set([
    'background', 'foreground', 'card', 'card-foreground', 'primary', 'primary-foreground',
    'secondary', 'secondary-foreground', 'accent', 'accent-foreground', 'muted',
    'muted-foreground', 'border', 'input', 'ring', 'sidebar', 'sidebar-foreground',
    'sidebar-primary', 'sidebar-primary-foreground', 'sidebar-accent',
    'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring',
]);

/** A theme package controls presentation only, never routes or permissions. */
export function themeVariables(panel: PanelAppearance | null | undefined): Record<string, string> {
    return Object.fromEntries(
        Object.entries(panel?.theme?.tokens ?? [])
            .filter(([name, color]) => THEME_TOKENS.has(name) && typeof color === 'string'
                && /^#[0-9a-f]{6}$/i.test(color))
            .map(([name, color]) => [`--${name}`, color]),
    );
}

export function shellNavigationSlots(panel: PanelAppearance | null | undefined, position: string): ComponentNode[] {
    return (panel?.shellSlots ?? []).filter(node => node.type === 'navigation-slot'
        && node.props.position === position);
}

export interface PanelAppearance {
    id: string;
    brandName: string;
    brandSubtitle: string;
    brandLogo: string | null;
    brandLogoDisplay: 'full' | 'icon' | 'hidden';
    brandLogoPlacement: 'sidebar' | 'topbar' | 'both';
    tenantSwitcher: boolean;
    tenantSwitcherPlacement: 'sidebar' | 'topbar';
    globalSearch: boolean;
    notifications: boolean;
    footerLinks: PanelMenuLink[];
    userMenuLinks: PanelMenuLink[];
    userMenuSettings: boolean;
    userMenuLogout: boolean;
    primaryColor: string;
    primaryForeground: string;
    sidebarCollapsible: boolean;
    sidebarVariant: 'inset' | 'sidebar' | 'floating';
    themeMode: 'light' | 'dark' | 'system';
    fontFamily: string;
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    contentWidth: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    sidebarWidth: string;
    navigationPosition: 'sidebar' | 'top' | 'none';
    layout?: 'sidebar' | 'top' | 'full' | 'workspace';
    locale?: string;
    direction?: 'ltr' | 'rtl';
    supportedLocales?: string[];
    languageSwitcher?: boolean;
    navigationGroups?: NavigationGroupConfig[];
    shellSlots?: ComponentNode[];
    theme?: ThemeManifest;
    topbar: boolean;
    breadcrumbs: boolean;
    stickyHeader: boolean;
    mobileNavigation: boolean;
}

export interface LavertiaPayload {
    version: number;
    title?: string;
    tree: ComponentNode;
}

export type TableRow = Record<string, Scalar>;
export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface TableColumn {
    key: string;
    label: string;
    sortable: boolean;
    badge: boolean;
    badgeTones: Record<string, Tone>;
}

const badgeClasses: Record<Tone, string> = {
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20',
    warning: 'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',
    danger: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20',
    info: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20',
    neutral: 'bg-gray-100 text-gray-700 ring-gray-500/20 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-500/30',
};

const statAccentClasses: Record<string, string> = {
    primary: 'bg-amber-400 ring-amber-500/20',
    success: 'bg-emerald-400 ring-emerald-500/20',
    warning: 'bg-orange-400 ring-orange-500/20',
    neutral: 'bg-gray-400 ring-gray-500/20',
};

export function badgeClass(tone: unknown): string {
    const value = typeof tone === 'string' && tone in badgeClasses ? tone as Tone : 'neutral';
    return badgeClasses[value];
}

export function statAccentClass(tone: unknown): string {
    return typeof tone === 'string' && tone in statAccentClasses
        ? statAccentClasses[tone]
        : statAccentClasses.neutral;
}

export function tableColumns(node: ComponentNode): TableColumn[] {
    return node.components
        .filter((component) => component.type === 'text-column')
        .map((component) => ({
            key: String(component.props.name ?? ''),
            label: String(component.props.label ?? component.props.name ?? ''),
            sortable: component.props.sortable === true,
            badge: component.props.badge === true,
            badgeTones: isRecord(component.props.badgeTones)
                ? component.props.badgeTones as Record<string, Tone>
                : {},
        }));
}

export function tableRows(node: ComponentNode): TableRow[] {
    return Array.isArray(node.props.rows) ? node.props.rows as TableRow[] : [];
}

export function visibleTableRows(
    rows: TableRow[],
    columns: TableColumn[],
    query: string,
    sortKey: string | null,
    direction: 'asc' | 'desc',
): TableRow[] {
    const term = query.trim().toLocaleLowerCase();
    const filtered = term === ''
        ? [...rows]
        : rows.filter((row) =>
            columns.some((column) => String(row[column.key] ?? '').toLocaleLowerCase().includes(term)),
        );

    if (sortKey && columns.some((column) => column.key === sortKey && column.sortable)) {
        const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

        filtered.sort((a, b) => {
            const comparison = collator.compare(String(a[sortKey] ?? ''), String(b[sortKey] ?? ''));
            return direction === 'asc' ? comparison : -comparison;
        });
    }

    return filtered;
}

export function columnBadgeTone(column: TableColumn, value: Scalar): Tone {
    const candidate = column.badgeTones[String(value ?? '')];
    return candidate === 'success' || candidate === 'warning' || candidate === 'danger'
        || candidate === 'info' || candidate === 'neutral'
        ? candidate
        : 'neutral';
}

/** Validate protocol header links again before rendering in a host adapter. */
export function headerLinks(value: unknown): HeaderLink[] {
    if (!Array.isArray(value)) return [];

    return value.flatMap((item): HeaderLink[] => {
        if (!item || typeof item !== 'object' || typeof item.label !== 'string') return [];
        const url = item.url === null ? null : safeHref(item.url);
        if (url !== null && !url.startsWith('/')) return [];
        if (item.url !== null && url === null) return [];
        return [{ label: item.label, url, active: item.active === true }];
    });
}

/** Preserve the current Inertia URL while changing only the requested language. */
export function localeUrl(currentUrl: string, locale: string): string {
    const [withoutHash, hash] = currentUrl.split('#', 2);
    const [pathname, query] = withoutHash.split('?', 2);
    const params = new URLSearchParams(query ?? '');
    params.set('lang', locale);

    return (pathname.startsWith('/') ? pathname : '/') + '?' + params.toString() + (hash ? '#' + hash : '');
}

/** Localized display name; no hard-coded list of 120+ language names is needed. */
export function localeLabel(code: string, activeLocale: string): string {
    try {
        return new Intl.DisplayNames([activeLocale], { type: 'language' }).of(code) ?? code;
    } catch {
        return code;
    }
}

export function safeHref(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    if (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')) {
        return value;
    }

    try {
        const url = new URL(value);
        if (url.protocol === 'https:' && !url.username && !url.password && !/\s|\\/.test(value)) {
            return value;
        }
    } catch {
        return null;
    }

    return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
