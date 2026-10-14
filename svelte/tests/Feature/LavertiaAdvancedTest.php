<?php

declare(strict_types=1);

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('requires authentication for the model-backed page', function (): void {
    $this->get('/admin/model-demo')->assertRedirect(route('login'));
});

it('only returns the current user in a scoped, server-paginated table', function (): void {
    $user = User::factory()->create(['name' => 'Visible User']);
    User::factory()->create(['name' => 'Another User']);

    $this->actingAs($user)->get('/admin/model-demo')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('lavertia/page')
            ->where('lavertia.tree.components.1.type', 'table')
            ->where('lavertia.tree.components.1.props.mode', 'eloquent')
            ->where('lavertia.tree.components.1.props.pagination.total', 1)
            ->where('lavertia.tree.components.1.props.rows.0.name', 'Visible User')
            ->missing('lavertia.tree.components.1.props.rows.0.password')
            ->etc());
});

it('supports Arabic locale and RTL direction on Lavertia pages', function (): void {
    $this->actingAs(User::factory()->create())
        ->get('/admin/dashboard?lang=ar')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('lavertia/page')
            ->where('lavertia.locale', 'ar')
            ->where('lavertia.direction', 'rtl')
            ->where('lavertia.tree.components.0.props.title', 'نظرة عامة')
            ->etc());
});
