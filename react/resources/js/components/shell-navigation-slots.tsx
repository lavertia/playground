import { usePage } from '@inertiajs/react';
import LavertiaRenderer, { NavigationDisplayContext } from '@/components/lavertia/renderer';
import { shellNavigationSlots } from '@/components/lavertia/types';
import type { PanelAppearance } from '@/components/lavertia/types';

export function ShellNavigationSlots({
    position,
    collapsed = false,
}: {
    position: string;
    collapsed?: boolean;
}) {
    const { props } = usePage();
    const panel = props.lavertiaPanel as PanelAppearance | null | undefined;
    const nodes = shellNavigationSlots(panel, position);

    if (!nodes.length) return null;

    return (
        <NavigationDisplayContext.Provider value={{ position, collapsed }}>
            <div data-lavertia-position={position}
                className={`flex min-w-0 flex-col gap-2 ${collapsed ? 'items-center gap-1' : ''}`}>
                {nodes.map(node => <LavertiaRenderer key={node.key} node={node} />)}
            </div>
        </NavigationDisplayContext.Provider>
    );
}
