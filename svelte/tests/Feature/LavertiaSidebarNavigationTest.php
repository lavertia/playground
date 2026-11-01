<?php

declare(strict_types=1);

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();
});

it('shares the same server-authoritative panel links with the host sidebar', function (): void {
    $this->actingAs(User::factory()->create())
        ->get('/admin/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('lavertia/page')
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
