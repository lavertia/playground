<?php

declare(strict_types=1);

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();
});

it('requires an authenticated user for the Filament-style React table laboratory', function (): void {
    $this->get('/admin/filament-tables-lab')->assertRedirect('/login');
});

it('provides only fictitious client-side fixtures to the React component', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/admin/filament-tables-lab')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('lavertia/page')
            ->where('lavertia.title', 'Filament Tables Lab')
            ->where('lavertia.tree.components.1.type', 'filament-tables-lab')
            ->where('lavertia.tree.components.1.props.demoOnly', true)
            ->has('lavertia.tree.components.1.props.users', 51)
            ->has('lavertia.tree.components.1.props.posts', 50)
            ->where('lavertia.tree.components.1.props.users.0.name', 'Dan Harrin')
            ->where('lavertia.tree.components.1.props.users.0.email', 'dan.harrin@example.test')
            ->where('lavertia.tree.components.1.props.posts.0.status', 'published')
            ->where('lavertia.seo.robots', 'noindex,nofollow')
            ->etc());
});

it('keeps RTL direction in the first Inertia response', function (): void {
    $this->actingAs(User::factory()->create())
        ->get('/admin/filament-tables-lab?lang=ar')
        ->assertOk()
        ->assertSee('lang="ar" dir="rtl"', false)
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.direction', 'rtl')
            ->where('lavertia.locale', 'ar')
            ->where('lavertia.tree.components.1.props.locale', 'ar')
            ->etc());
});
