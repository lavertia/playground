<?php

declare(strict_types=1);

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();
});

it('shows the registered admin panel links in the existing host sidebar', function (): void {
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
            ->where('lavertiaPanel.id', 'admin')
            ->where('lavertiaPanel.brandName', 'Lavertia')
            ->where('lavertiaPanel.brandSubtitle', 'Playground')
            ->where('lavertiaPanel.primaryColor', '#f59e0b')
            ->where('lavertiaPanel.sidebarVariant', 'inset')
            ->etc());
});

it('does not expose authenticated panel links to guests', function (): void {
    $this->get('/login')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertiaSidebar', [])
            ->where('lavertiaPanel', null)
            ->etc());
});

it('resolves Arabic RTL on the first response for host and Lavertia Page', function (): void {
    $this->actingAs(User::factory()->create())
        ->get('/admin/dashboard?lang=ar')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertiaSidebarDirection', 'rtl')
            ->where('lavertia.direction', 'rtl')
            ->etc());
});
