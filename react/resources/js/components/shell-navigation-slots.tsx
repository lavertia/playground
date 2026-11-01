import { usePage } from '@inertiajs/react';
import LavertiaRenderer from '@/components/lavertia/renderer';
import { shellNavigationSlots } from '@/components/lavertia/types';
import type { PanelAppearance } from '@/components/lavertia/types';

export function ShellNavigationSlots({ position }: { position: string }) {
    const { props } = usePage();
    const panel = props.lavertiaPanel as PanelAppearance | null | undefined;
    const nodes = shellNavigationSlots(panel, position);

    if (!nodes.length) return null;

    return (
        <div data-lavertia-position={position} className="flex min-w-0 flex-col gap-2">
            {nodes.map(node => <LavertiaRenderer key={node.key} node={node} />)}
        </div>
    );
}
