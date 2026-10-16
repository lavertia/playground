<?php

declare(strict_types=1);

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();
});

it('redirects guests away from the Lavertia dashboard', function (): void {
    $this->get('/admin/dashboard')->assertRedirect(route('login'));
});

it('renders the same protocol for authenticated users', function (): void {
    $this->actingAs(User::factory()->create())
        ->get('/admin/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('lavertia/page')
            ->where('lavertia.version', 1)
            ->where('lavertia.title', 'Overview')
            ->where('lavertia.tree.components.0.type', 'page-header')
            ->where('lavertia.tree.components.1.type', 'stats-grid')
            ->where('lavertia.tree.components.2.type', 'section')
            ->etc());
});
