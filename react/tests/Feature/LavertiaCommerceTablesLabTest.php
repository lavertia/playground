<?php

declare(strict_types=1);

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();
});

it('requires authentication for the Commerce Tables Lab', function (): void {
    $this->get('/admin/commerce-tables-lab')->assertRedirect('/login');
});

it('renders native Eloquent Product and Order tables, without serializing all demo fixtures', function (): void {
    $this->actingAs(User::factory()->create())
        ->get('/admin/commerce-tables-lab')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('lavertia/page')
            ->where('lavertia.title', 'Commerce Tables Lab')
            ->where('lavertia.tree.components.2.components.0.type', 'table')
            ->where('lavertia.tree.components.2.components.0.props.name', 'lab-products')
            ->where('lavertia.tree.components.2.components.0.props.mode', 'eloquent')
            ->where('lavertia.tree.components.2.components.0.props.pagination.total', 0)
            ->where('lavertia.tree.components.3.components.0.type', 'table')
            ->where('lavertia.tree.components.3.components.0.props.name', 'lab-orders')
            ->where('lavertia.tree.components.3.components.0.props.mode', 'eloquent')
            ->where('lavertia.tree.components.3.components.0.props.pagination.total', 0)
            ->etc());
});

it('keeps RTL and Arabic locale on first response', function (): void {
    $this->actingAs(User::factory()->create())
        ->get('/admin/commerce-tables-lab?lang=ar')
        ->assertOk()
        ->assertSee('lang="ar" dir="rtl"', false)
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.direction', 'rtl')
            ->where('lavertia.locale', 'ar')
            ->etc());
});
