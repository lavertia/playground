<?php

declare(strict_types=1);

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();
});

it('requires authentication for Users and Posts', function (): void {
    $this->get('/admin/filament-tables-lab')->assertRedirect('/login');
});

it('renders native PHP Tables based on Eloquent, not browser-only fixtures', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/admin/filament-tables-lab')->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('lavertia/page')
            ->where('lavertia.title', 'Users & Posts Tables')
            ->where('lavertia.tree.components.1.components.0.type', 'table')
            ->where('lavertia.tree.components.1.components.0.props.name', 'lab-users')
            ->where('lavertia.tree.components.1.components.0.props.mode', 'eloquent')
            ->where('lavertia.tree.components.1.components.0.props.pagination.total', 1)
            ->where('lavertia.tree.components.1.components.0.props.rows.0.email', $user->email)
            ->missing('lavertia.tree.components.1.components.0.props.rows.0.password')
            ->where('lavertia.tree.components.2.components.0.type', 'table')
            ->where('lavertia.tree.components.2.components.0.props.name', 'lab-posts')
            ->where('lavertia.tree.components.2.components.0.props.mode', 'eloquent')
            ->where('lavertia.tree.components.2.components.0.props.pagination.total', 0)
            ->etc());
});

it('includes server-selected language and RTL in the first response', function (): void {
    $this->actingAs(User::factory()->create())
        ->get('/admin/filament-tables-lab?lang=ar')
        ->assertOk()
        ->assertSee('lang="ar" dir="rtl"', false)
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.direction', 'rtl')
            ->where('lavertia.locale', 'ar')
            ->etc());
});
