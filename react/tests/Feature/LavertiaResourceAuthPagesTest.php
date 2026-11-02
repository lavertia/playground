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

it('keeps another team record hidden even when owned by the current user', function (): void {
    $owner = User::factory()->create();
    $differentTeamId = (int) ($owner->current_team_id ?? 0) + 999;

    $ticket = DemoTicket::query()->create([
        'owner_id' => $owner->getKey(),
        'team_id' => $differentTeamId,
        'title' => 'Ticket from another team',
    ]);

    $this->actingAs($owner)
        ->get('/admin/demo-tickets/'.$ticket->getKey())
        ->assertNotFound();

    $this->get('/admin/demo-tickets/'.$ticket->getKey().'/edit')
        ->assertNotFound();
});

it('reuses the same Page for published/draft routes with isolated server parameters', function (): void {
    $owner = User::factory()->create();

    DemoTicket::query()->create([
        'owner_id' => $owner->getKey(),
        'team_id' => $owner->current_team_id,
        'status' => 'published',
        'title' => 'Public release note',
    ]);

    DemoTicket::query()->create([
        'owner_id' => $owner->getKey(),
        'team_id' => $owner->current_team_id,
        'status' => 'draft',
        'title' => 'Private draft',
    ]);

    $this->actingAs($owner)
        ->get('/admin/demo-tickets/published?status=draft&heading=Injected')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.0.props.title', 'Published tickets')
            ->where('lavertia.tree.components.1.components.0.props.pagination.total', 1)
            ->where('lavertia.tree.components.1.components.0.props.rows.0.title', 'Public release note')
            ->etc());

    $this->get('/admin/demo-tickets/drafts')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.0.props.title', 'Draft tickets')
            ->where('lavertia.tree.components.1.components.0.props.rows.0.title', 'Private draft')
            ->etc());

    expect(\App\Lavertia\Resources\DemoTicketResource::getUrl(
        'published',
        panelId: 'admin',
    ))->toBe('/admin/demo-tickets/published');
});

it('renders getTabs with scoped Eloquent counts, label badges and Inertia URLs', function (): void {
    $owner = User::factory()->create();

    DemoTicket::query()->create([
        'owner_id' => $owner->getKey(),
        'team_id' => $owner->current_team_id,
        'status' => 'draft',
        'title' => 'Draft from same tenant',
    ]);

    DemoTicket::query()->create([
        'owner_id' => $owner->getKey(),
        'team_id' => $owner->current_team_id,
        'status' => 'published',
        'title' => 'Published from same tenant',
    ]);

    $this->actingAs($owner)
        ->get('/admin/demo-tickets?activeTab=published&tenant_id=other')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.0.props.tabs.0.label', 'All tickets')
            ->where('lavertia.tree.components.0.props.tabs.1.label', 'Published')
            ->where('lavertia.tree.components.0.props.tabs.1.badge', '1')
            ->where('lavertia.tree.components.0.props.tabs.1.badgeColor', 'success')
            ->where('lavertia.tree.components.0.props.tabs.1.active', true)
            ->where('lavertia.tree.components.1.components.0.props.pagination.total', 1)
            ->where('lavertia.tree.components.1.components.0.props.rows.0.title', 'Published from same tenant')
            ->etc());

    $this->get('/admin/demo-tickets?activeTab=drafts')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.0.props.tabs.2.active', true)
            ->where('lavertia.tree.components.1.components.0.props.rows.0.title', 'Draft from same tenant')
            ->etc());
});

it('provides named URL placeholders independently of fixed Page parameters', function (): void {
    $owner = User::factory()->create();
    $ticket = DemoTicket::query()->create([
        'owner_id' => $owner->getKey(),
        'team_id' => $owner->current_team_id,
        'status' => 'draft',
        'title' => 'Authorized history',
    ]);

    $this->actingAs($owner)
        ->get(\App\Lavertia\Resources\DemoTicketResource::getUrl(
            'history',
            ['record' => $ticket->getKey(), 'period' => '2026'],
            'admin',
        ))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.0.props.title', 'Ticket history (2026)')
            ->where('lavertia.seo.robots', 'noindex,nofollow')
            ->etc());
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
