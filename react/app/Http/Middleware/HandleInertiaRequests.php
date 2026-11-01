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
            'lavertiaNotifications' => function () use ($request): array {
                $user = $request->user();

                if ($user === null) {
                    return [];
                }

                $registry = app(\Lavertia\Panels\PanelRegistry::class);
                $panelId = $registry->panelForRoute($request->route()?->getName());
                $appearance = $panelId !== null ? $registry->appearance($panelId) : null;

                if (($appearance['notifications'] ?? false) !== true) {
                    return [];
                }

                return $user->notifications()->latest()->limit(10)->get()
                    ->map(static function ($notification): array {
                        $data = is_array($notification->data) ? $notification->data : [];
                        $url = $data['url'] ?? null;

                        return [
                            'id' => (string) $notification->id,
                            'title' => mb_substr((string) ($data['title'] ?? 'Notification'), 0, 120),
                            'message' => mb_substr((string) ($data['message'] ?? ''), 0, 250),
                            'url' => is_string($url) && str_starts_with($url, '/') && ! str_starts_with($url, '//')
                                && ! str_contains($url, chr(92)) && preg_match('/\\s/', $url) !== 1 ? $url : null,
                            'read' => $notification->read_at !== null,
                        ];
                    })->all();
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
            'lavertiaSidebarDirection' => function () use ($request): string {
                $registry = app(\Lavertia\Panels\PanelRegistry::class);
                $panelId = $registry->panelForRoute($request->route()?->getName());

                return $panelId !== null
                    ? \Lavertia\Panels\Localization\LocaleContext::resolve($request, $registry, $panelId)['direction']
                    : \Lavertia\Panels\Localization\LocaleContext::direction((string) config('app.locale', 'en'));
            },        ];
    }
}
