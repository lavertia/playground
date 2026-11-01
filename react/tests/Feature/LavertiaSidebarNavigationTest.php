<?php

declare(strict_types=1);

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();
});

it('shares the same server-authoritative panel links with the host sidebar', function (): void {
    $response = $this->actingAs(User::factory()->create())
        ->get('/admin/dashboard');

    fwrite(STDERR, 'NAV_DIAGNOSTICS='.json_encode([
        'configCount' => count(config('lavertia.panels.admin.navigation', [])),
        'authenticated' => auth()->check(),
        'routeExists' => \Illuminate\Support\Facades\Route::has('lavertia.admin.dashboard'),
        'directRegistryCount' => count(app(\Lavertia\Panels\PanelRegistry::class)->navigation('admin', 'lavertia.admin.dashboard')),
    ]).PHP_EOL);

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('lavertia/page')
            ->has('lavertia.navigation', 3)
            ->has('lavertiaSidebar', 3)
            ->where('lavertiaSidebar.0.slug', 'dashboard')
            ->where('lavertiaSidebar.0.active', true)
            ->where('lavertiaSidebar.0.url', '/admin/dashboard')
            ->where('lavertiaSidebarDirection', 'ltr')
            ->has('lavertia.navigation', 3)
            ->etc());
});

it('does not share authenticated panel links with guests', function (): void {
    $this->get('/login')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertiaSidebar', [])
            ->etc());
});

it('uses RTL for the host navigation and the PHP-rendered Lavertia Page', function (): void {
    $this->actingAs(User::factory()->create())
        ->get('/admin/dashboard?lang=ar')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertiaSidebarDirection', 'rtl')
            ->etc());
});
