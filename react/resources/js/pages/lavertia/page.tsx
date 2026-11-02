import { Head, Link, usePage } from '@inertiajs/react';
import LavertiaRenderer from '../../components/lavertia/renderer';
import type { LavertiaPayload } from '../../components/lavertia/types';

export default function LavertiaPage({ lavertia }: { lavertia: LavertiaPayload }) {
    const page = usePage();

    if (lavertia.version !== 1) {
        return <p role="alert" className="p-6 text-sm text-rose-700">Unsupported Lavertia protocol version.</p>;
    }

    const navigation = lavertia.navigation ?? [];
    // The hosting Starter Kit owns the sidebar when it explicitly shares
    // lavertiaSidebar. Keep embedded navigation for existing integrations.
    const hostSidebar = Object.prototype.hasOwnProperty.call(page.props, 'lavertiaSidebar');

    const maxWidths: Record<string, string> = {
        sm: '24rem', md: '32rem', lg: '48rem', xl: '64rem', '2xl': '80rem', full: '100%',
    };
    const presentation = lavertia.presentation;
    const variant = presentation?.variant ?? 'default';
    const maxWidth = maxWidths[presentation?.maxWidth ?? 'full'] ?? '100%';
    const content = (() => {
        if (variant === 'split' && lavertia.regions?.left && lavertia.regions?.right) {
            const ratio = presentation?.ratio ?? 'balanced';
            const columns = ratio === 'start-wide'
                ? 'lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'
                : ratio === 'end-wide'
                    ? 'lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]'
                    : 'lg:grid-cols-2';

            return (
                <div className={`grid w-full min-w-0 gap-6 ${columns}`}>
                    <section aria-label="Primary section" className="min-w-0">
                        <LavertiaRenderer node={lavertia.regions.left} />
                    </section>
                    <section aria-label="Secondary section" className="min-w-0">
                        <LavertiaRenderer node={lavertia.regions.right} />
                    </section>
                </div>
            );
        }

        const tree = <LavertiaRenderer node={lavertia.tree} />;

        if (variant === 'card') {
            const padding = presentation?.padding === 'compact' ? 'p-4 sm:p-5'
                : presentation?.padding === 'spacious' ? 'p-8 sm:p-10' : 'p-6 sm:p-8';
            return <div className={`mx-auto w-full rounded-xl border border-border bg-card text-card-foreground shadow-sm ${padding}`} style={{ maxWidth }}>{tree}</div>;
        }

        if (variant === 'flat') {
            return <div className="mx-auto w-full min-w-0" style={{ maxWidth }}>{tree}</div>;
        }

        return tree;
    })();

    return (
        <>
            <Head title={lavertia.seo?.title ?? lavertia.title ?? 'Lavertia'}>
                {lavertia.seo?.description && <meta head-key="description" name="description" content={lavertia.seo.description} />}
                {lavertia.seo?.robots && <meta head-key="robots" name="robots" content={lavertia.seo.robots} />}
                {lavertia.seo?.canonical && <link head-key="canonical" rel="canonical" href={lavertia.seo.canonical} />}
            </Head>
            <main lang={lavertia.locale ?? 'en'} dir={lavertia.direction ?? 'ltr'} className="min-h-[calc(100vh-8rem)] bg-gray-50/70 px-4 py-6 sm:px-6 lg:px-8 dark:bg-gray-950/40">
                <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 lg:flex-row">
                    {!hostSidebar && navigation.length > 0 && (
                        <aside className="w-full shrink-0 lg:w-60">
                            <nav aria-label="Panel navigation" className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-gray-900/70">
                                <ul className="space-y-1">
                                    {navigation.map((item, index) => (
                                        <li key={item.slug}>
                                            {item.group && (index === 0 || navigation[index - 1]?.group !== item.group) && (
                                                <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{item.group}</p>
                                            )}
                                            <Link
                                                href={item.url}
                                                aria-current={item.active ? 'page' : undefined}
                                                className={`block rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${item.active
                                                    ? 'bg-amber-100 text-amber-950 dark:bg-amber-400/20 dark:text-amber-200'
                                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'}`}
                                            >
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </aside>
                    )}
                    <div className="min-w-0 flex-1">
                        {content}
                    </div>
                </div>
            </main>
        </>
    );
}
