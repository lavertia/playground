<?php

declare(strict_types=1);

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Lavertia\Panels\Navigation\NavigationItem;
use Lavertia\Panels\PanelRegistry;

beforeEach(function (): void {
    $this->withoutVite();

    // This older Playground branch configures Pages but no navigation entries.
    // Explicitly register one real Page link to exercise the backend contract.
    app(PanelRegistry::class)->navigationItem('admin', NavigationItem::make('dashboard', 'Dashboard'));
});

it('shares the same server-authoritative panel links with the host sidebar', function (): void {
    $this->actingAs(User::factory()->create())
        ->get('/admin/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('lavertia/page')
            ->has('lavertia.navigation', 1)
            ->has('lavertiaSidebar', 1)
            ->where('lavertiaSidebar.0.slug', 'dashboard')
            ->where('lavertiaSidebar.0.active', true)
            ->where('lavertiaSidebar.0.url', '/admin/dashboard')
            ->where('lavertiaSidebarDirection', 'ltr')
            ->etc());
});

it('does not share authenticated panel links with guests', function (): void {
    $this->get('/login')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertiaSidebar', [])
            ->etc());
});

it('sends the correct first-response RTL direction to the host sidebar', function (): void {
    $this->actingAs(User::factory()->create())
        ->get('/admin/dashboard?lang=ar')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertiaSidebarDirection', 'rtl')
            ->etc());
});
