<?php

declare(strict_types=1);

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();
});

it('requires authentication before opening Commerce Tables Lab', function (): void {
    $this->get('/admin/commerce-tables-lab')->assertRedirect('/login');
});

it('serves deterministic fictional products and orders using the Lavertia component protocol', function (): void {
    $this->actingAs(User::factory()->create())
        ->get('/admin/commerce-tables-lab')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('lavertia/page')
            ->where('lavertia.title', 'Commerce Tables Lab')
            ->where('lavertia.tree.components.1.type', 'commerce-tables-lab')
            ->where('lavertia.tree.components.1.props.demoOnly', true)
            ->has('lavertia.tree.components.1.props.products', 55)
            ->has('lavertia.tree.components.1.props.orders', 1011)
            ->where('lavertia.tree.components.1.props.products.0.name', 'Artisan Candle Set')
            ->where('lavertia.tree.components.1.props.products.0.quantity', 33)
            ->where('lavertia.tree.components.1.props.orders.0.status', 'cancelled')
            ->where('lavertia.seo.robots', 'noindex,nofollow')
            ->etc());
});

it('keeps RTL and Arabic locale on the first response', function (): void {
    $this->actingAs(User::factory()->create())
        ->get('/admin/commerce-tables-lab?lang=ar')
        ->assertOk()
        ->assertSee('lang="ar" dir="rtl"', false)
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.direction', 'rtl')
            ->where('lavertia.locale', 'ar')
            ->where('lavertia.tree.components.1.props.locale', 'ar')
            ->etc());
});
