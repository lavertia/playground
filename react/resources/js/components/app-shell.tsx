import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { AppVariant } from '@/types';
import { themeVariables } from '@/components/lavertia/types';
import type { PanelAppearance } from '@/components/lavertia/types';

type Props = {
    children: ReactNode;
    variant?: AppVariant;
};

export function AppShell({ children, variant = 'sidebar' }: Props) {
    const page = usePage();
    const panel = page.props.lavertiaPanel as PanelAppearance | null | undefined;
    const isOpen = page.props.sidebarOpen;
    const direction = page.props.lavertiaSidebarDirection === 'rtl' ? 'rtl' : 'ltr';

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col" data-lavertia-theme={panel?.theme?.id ?? 'default'} style={themeVariables(panel)}>{children}</div>
        );
    }

    const radii = { none: '0rem', sm: '0.25rem', md: '0.5rem', lg: '0.75rem', xl: '1rem' };

    return (
        <SidebarProvider
            data-lavertia-theme={panel?.theme?.id ?? 'default'}
            defaultOpen={isOpen}
            dir={direction}
            data-panel-theme={panel?.themeMode ?? 'system'}
            style={{
                '--sidebar-width': panel?.sidebarWidth ?? '18rem',
                '--radius': radii[panel?.borderRadius ?? 'md'],
                ...themeVariables(panel),
                fontFamily: panel?.fontFamily === 'inherit' ? undefined : panel?.fontFamily,
            } as React.CSSProperties}
        >
            {children}
        </SidebarProvider>
    );
}
