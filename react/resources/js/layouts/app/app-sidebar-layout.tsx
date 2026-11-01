import { usePage } from '@inertiajs/react';
import { AppContent } from '@/components/app-content';
import type { PanelAppearance } from '@/components/lavertia/types';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { PanelLocaleSwitcher } from '@/components/panel-locale-switcher';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const panel = usePage().props.lavertiaPanel as PanelAppearance | null | undefined;
    const maxWidths = { sm: '40rem', md: '48rem', lg: '64rem', xl: '80rem', '2xl': '96rem', full: 'none' };

    if (panel?.layout === 'full') {
        return (
            <div className="relative min-h-screen w-full" data-panel-layout="full">
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
                <div className="mx-auto w-full min-w-0 flex-1" style={{ maxWidth: maxWidths[panel?.contentWidth ?? 'full'] }}>
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
