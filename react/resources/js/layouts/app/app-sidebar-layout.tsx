import { usePage } from '@inertiajs/react';
import { AppContent } from '@/components/app-content';
import { shellNavigationSlots, themeVariables } from '@/components/lavertia/types';
import type { PanelAppearance } from '@/components/lavertia/types';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { PanelLocaleSwitcher } from '@/components/panel-locale-switcher';
import { ShellNavigationSlots } from '@/components/shell-navigation-slots';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const panel = usePage().props.lavertiaPanel as PanelAppearance | null | undefined;
    const context = panel?.layout === 'workspace' && shellNavigationSlots(panel, 'context').length > 0;
    const maxWidths = { sm: '40rem', md: '48rem', lg: '64rem', xl: '80rem', '2xl': '96rem', full: 'none' };

    if (panel?.layout === 'full') {
        return (
            <div className="relative min-h-screen w-full" data-panel-layout="full" data-lavertia-theme={panel.theme?.id ?? 'default'} style={themeVariables(panel)}>
                {panel.languageSwitcher && (
                    <div className="absolute end-4 top-4 z-20">
                        <PanelLocaleSwitcher />
                    </div>
                )}
                {children}
            </div>
        );
    }

    if (panel?.layout === 'top') {
        return (
            <AppShell variant="header">
                <AppSidebarHeader breadcrumbs={breadcrumbs} showSidebarTrigger={false} />
                <AppContent variant="header" className="min-w-0 w-full max-w-none overflow-x-clip">
                    <div className="mx-auto w-full min-w-0 flex-1" style={{ maxWidth: maxWidths[panel?.contentWidth ?? 'full'] }}>
                        {children}
                    </div>
                </AppContent>
            </AppShell>
        );
    }

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="min-w-0 overflow-x-clip">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="flex min-w-0 flex-1">
                    <div className="mx-auto w-full min-w-0 flex-1" style={{ maxWidth: maxWidths[panel?.contentWidth ?? 'full'] }}>
                        {children}
                    </div>
                    {context && (
                        <aside aria-label="Context navigation" className="hidden w-64 shrink-0 border-s border-border p-3 xl:block">
                            <ShellNavigationSlots position="context" />
                        </aside>
                    )}
                </div>
                {context && (
                    <details className="mx-4 mb-4 rounded-md border border-border p-3 xl:hidden">
                        <summary className="cursor-pointer text-sm font-semibold">Context navigation</summary>
                        <ShellNavigationSlots position="context" />
                    </details>
                )}
            </AppContent>
        </AppShell>
    );
}
