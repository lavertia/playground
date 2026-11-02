<?php

declare(strict_types=1);

use App\Lavertia\Models\DemoTicket;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();
});

it('serves policy-authorized Resource list/create/view/edit with reusable Page variants', function (): void {
    $owner = User::factory()->create();
    $ticket = DemoTicket::query()->create([
        'owner_id' => $owner->getKey(),
        'team_id' => $owner->current_team_id,
        'title' => 'Owner ticket',
    ]);

    $this->get('/admin/demo-tickets')->assertRedirect('/login');

    $this->actingAs($owner)
        ->get('/admin/demo-tickets')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('lavertia/page')
            ->where('lavertia.seo.robots', 'noindex,nofollow')
            ->where('lavertia.tree.components.1.components.0.props.name', 'demo-tickets')
            ->etc());

    $this->get('/admin/demo-tickets/create')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.presentation.variant', 'flat')
            ->etc());

    $this->get('/admin/demo-tickets/'.$ticket->getKey())
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.presentation.variant', 'card')
            ->where('lavertia.tree.components.1.components.0.props.value', 'Owner ticket')
            ->etc());

    $this->get('/admin/demo-tickets/'.$ticket->getKey().'/edit')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.presentation.variant', 'split')
            ->where('lavertia.regions.left.components.0.props.title', 'Edit Owner ticket')
            ->etc());
});

it('never resolves a cross-user ticket even if the record ID is guessed', function (): void {
    $owner = User::factory()->create();
    $other = User::factory()->create();

    $ticket = DemoTicket::query()->create([
        'owner_id' => $owner->getKey(),
        'team_id' => $owner->current_team_id,
        'title' => 'Private owner record',
    ]);

    $this->actingAs($other)
        ->get('/admin/demo-tickets/'.$ticket->getKey())
        ->assertNotFound();

    $this->get('/admin/demo-tickets/'.$ticket->getKey().'/edit')
        ->assertNotFound();
});

it('renders central and Panel-linked Auth Pages as guest-only standalone components', function (): void {
    $this->get('/identity-demo/sign-in-preview')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('lavertia/standalone')
            ->where('lavertia.presentation.variant', 'split')
            ->where('lavertia.seo.robots', 'noindex,nofollow')
            ->where('lavertiaPanel', null)
            ->etc());

    $this->get('/admin/auth/sign-in-preview?lang=ar')
        ->assertOk()
        ->assertSee('lang="ar" dir="rtl"', false)
        ->assertInertia(fn (Assert $page) => $page
            ->component('lavertia/standalone')
            ->where('lavertia.locale', 'ar')
            ->where('lavertia.seo.canonical', null)
            ->where('lavertiaPanel', null)
            ->etc());
});
