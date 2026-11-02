<?php

declare(strict_types=1);

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();
});

it('renders public FlatPage without Panel navigation and with canonical SEO', function (): void {
    $this->get('/lavertia-demo')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('lavertia/standalone')
            ->where('lavertia.presentation.variant', 'flat')
            ->where('lavertia.seo.robots', 'index,follow')
            ->where('lavertia.seo.title', 'Lavertia — Composable Laravel Pages')
            ->has('lavertia.seo.canonical')
            ->where('lavertiaPanel', null)
            ->etc());
});

it('serializes public split regions as normal Lavertia components', function (): void {
    $this->get('/lavertia-demo/split')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('lavertia/standalone')
            ->where('lavertia.presentation.variant', 'split')
            ->where('lavertia.presentation.ratio', 'start-wide')
            ->where('lavertia.regions.left.components.0.props.title', 'A two-column page')
            ->where('lavertia.regions.right.components.0.props.title', 'Secondary content')
            ->where('lavertia.seo.robots', 'noindex,nofollow')
            ->etc());
});

it('keeps CardPage behind Panel middleware and disallows indexing', function (): void {
    $this->get('/admin/card-example')->assertRedirect('/login');

    $this->actingAs(User::factory()->create())
        ->get('/admin/card-example')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('lavertia/page')
            ->where('lavertia.presentation.variant', 'card')
            ->where('lavertia.presentation.maxWidth', 'md')
            ->where('lavertia.seo.robots', 'noindex,nofollow')
            ->etc());
});
