<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'currentTeam' => fn () => $user?->currentTeam ? $user->toUserTeam($user->currentTeam) : null,
            'teams' => fn () => $user?->toUserTeams(includeCurrent: true) ?? [],
            // The existing Starter Kit Sidebar is the single navigation surface.
            // Share the PanelRegistry's navigation on every authenticated Inertia page.
            // Safe, declarative Panel appearance. The Starter Kit renders it.
            'lavertiaPanel' => function () use ($request): ?array {
                if (! auth()->check()) {
                    return null;
                }

                $registry = app(\Lavertia\Panels\PanelRegistry::class);
                $panelId = $registry->panelForRoute($request->route()?->getName());

                return $panelId !== null ? $registry->appearance($panelId) : null;
            },
            'lavertiaSidebar' => function () use ($request): array {
                if (! auth()->check()) {
                    return [];
                }

                $registry = app(\Lavertia\Panels\PanelRegistry::class);
                $panelId = $registry->panelForRoute($request->route()?->getName());

                return $panelId !== null
                    ? $registry->navigation($panelId, $request->route()?->getName())
                    : [];
            },
            // Resolve locale from the request directly. Inertia's shared props
            // are prepared before the Page-level ResolveLocale middleware runs.
            'lavertiaSidebarDirection' => function () use ($request): string {
                $locale = $request->query('lang');

                if (! is_string($locale) || ! in_array($locale, ['en', 'ar', 'fr'], true)) {
                    $locale = $request->session()->get('lavertia_locale', config('app.locale', 'en'));
                }

                return in_array($locale, ['ar', 'fa', 'he', 'ur'], true) ? 'rtl' : 'ltr';
            },
        ];
    }
}
