<?php

declare(strict_types=1);

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();
});

it('protects the declarative tables page with authentication', function (): void {
    $this->get('/admin/declarative-tables')->assertRedirect('/login');
});

it('serializes a PHP-defined table with text and boolean icon columns', function (): void {
    $this->actingAs(User::factory()->create())
        ->get('/admin/declarative-tables')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('lavertia/page')
            ->where('lavertia.title', 'Declarative Tables')
            ->where('lavertia.tree.components.1.type', 'section')
            ->where('lavertia.tree.components.1.components.0.type', 'table')
            ->where('lavertia.tree.components.1.components.0.props.mode', 'snapshot')
            ->where('lavertia.tree.components.1.components.0.props.searchable', true)
            ->has('lavertia.tree.components.1.components.0.props.rows', 5)
            ->where('lavertia.tree.components.1.components.0.props.rows.0.is_featured', true)
            ->where('lavertia.tree.components.1.components.0.props.rows.1.is_featured', false)
            ->where('lavertia.tree.components.1.components.0.components.0.type', 'text-column')
            ->where('lavertia.tree.components.1.components.0.components.1.type', 'text-column')
            ->where('lavertia.tree.components.1.components.0.components.2.type', 'icon-column')
            ->where('lavertia.tree.components.1.components.0.components.2.props.boolean', true)
            ->where('lavertia.tree.components.1.components.0.components.2.props.name', 'is_featured')
            ->where('lavertia.seo.robots', 'noindex,nofollow')
            ->etc());
});

it('retains server-provided RTL before the React table is hydrated', function (): void {
    $this->actingAs(User::factory()->create())
        ->get('/admin/declarative-tables?lang=ar')
        ->assertOk()
        ->assertSee('lang="ar" dir="rtl"', false)
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.direction', 'rtl')
            ->where('lavertia.locale', 'ar')
            ->etc());
});
