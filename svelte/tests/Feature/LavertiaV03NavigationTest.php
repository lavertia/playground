<?php

declare(strict_types=1);

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();
});

it('keeps v0.3 navigation and registered Widgets behind authentication', function (): void {
    $this->get('/admin/inventory/overview')->assertRedirect(route('login'));
});

it('renders navigation and a dashboard Widget without changing protocol version', function (): void {
    $this->actingAs(User::factory()->create())
        ->get('/admin/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('lavertia/page')
            ->where('lavertia.version', 1)
            ->where('lavertia.navigation.0.label', 'Dashboard')
            ->where('lavertia.navigation.0.active', true)
            ->where('lavertia.navigation.1.label', 'Inventory')
            ->where('lavertia.navigation.1.url', '/admin/inventory/overview')
            ->where('lavertia.navigation.2.label', 'Model demo')
            ->where('lavertia.tree.components.5.type', 'stats-grid')
            ->etc());
});

it('marks only the active Inventory navigation item', function (): void {
    $this->actingAs(User::factory()->create())
        ->get('/admin/inventory/overview')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('lavertia/page')
            ->where('lavertia.navigation.0.active', false)
            ->where('lavertia.navigation.1.active', true)
            ->where('lavertia.navigation.1.group', 'Management')
            ->where('lavertia.tree.components.0.type', 'page-header')
            ->etc());
});
