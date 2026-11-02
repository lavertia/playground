<?php

declare(strict_types=1);

use App\Lavertia\Models\DemoTicket;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();
});

it('requires authentication before rendering the Table Showcase', function (): void {
    $this->get('/admin/tables-showcase')->assertRedirect('/login');
});

it('composes a searchable snapshot alongside an authorized Eloquent table', function (): void {
    $owner = User::factory()->create();
    $other = User::factory()->create();

    DemoTicket::query()->create([
        'owner_id' => $owner->getKey(),
        'team_id' => $owner->current_team_id,
        'title' => 'Visible for current user',
        'status' => 'published',
    ]);

    DemoTicket::query()->create([
        'owner_id' => $other->getKey(),
        'team_id' => $other->current_team_id,
        'title' => 'Another user confidential ticket',
        'status' => 'published',
    ]);

    $this->actingAs($owner)
        ->get('/admin/tables-showcase')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('lavertia/page')
            ->where('lavertia.title', 'Tables Showcase')
            ->where('lavertia.seo.robots', 'noindex,nofollow')
            ->where('lavertia.tree.components.2.type', 'section')
            ->where('lavertia.tree.components.2.components.0.type', 'table')
            ->where('lavertia.tree.components.2.components.0.props.name', 'showcase-directory')
            ->where('lavertia.tree.components.2.components.0.props.mode', 'snapshot')
            ->where('lavertia.tree.components.2.components.0.props.searchable', true)
            ->where('lavertia.tree.components.2.components.0.props.columnManager', true)
            ->where('lavertia.tree.components.2.components.0.props.reorderableColumns', true)
            ->has('lavertia.tree.components.2.components.0.props.rows', 12)
            ->has('lavertia.tree.components.2.components.0.components', 8)
            ->where('lavertia.tree.components.3.components.0.props.mode', 'eloquent')
            ->where('lavertia.tree.components.3.components.0.props.pagination.perPage', 5)
            ->where('lavertia.tree.components.3.components.0.props.pagination.total', 1)
            ->where('lavertia.tree.components.3.components.0.props.rows.0.title', 'Visible for current user')
            ->missing('lavertia.tree.components.3.components.0.props.rows.0.owner_id')
            ->etc());
});

it('filters and sorts only authorized Eloquent records using allowlisted columns', function (): void {
    $owner = User::factory()->create();

    DemoTicket::query()->create([
        'owner_id' => $owner->getKey(),
        'team_id' => $owner->current_team_id,
        'title' => 'Published preview',
        'status' => 'published',
    ]);

    DemoTicket::query()->create([
        'owner_id' => $owner->getKey(),
        'team_id' => $owner->current_team_id,
        'title' => 'Draft preview',
        'status' => 'draft',
    ]);

    $this->actingAs($owner)
        ->get('/admin/tables-showcase?lvt_showcase-tickets_filter_status=published&lvt_showcase-tickets_sort=owner_id')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.3.components.0.props.appliedSort', null)
            ->where('lavertia.tree.components.3.components.0.props.appliedFilters.status', 'published')
            ->where('lavertia.tree.components.3.components.0.props.pagination.total', 1)
            ->where('lavertia.tree.components.3.components.0.props.rows.0.title', 'Published preview')
            ->etc());

    $this->get('/admin/tables-showcase?lvt_showcase-tickets_search=Draft')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.3.components.0.props.pagination.total', 1)
            ->where('lavertia.tree.components.3.components.0.props.rows.0.title', 'Draft preview')
            ->etc());
});

it('renders RTL language metadata on the first response', function (): void {
    $this->actingAs(User::factory()->create())
        ->get('/admin/tables-showcase?lang=ar')
        ->assertOk()
        ->assertSee('lang="ar" dir="rtl"', false)
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.direction', 'rtl')
            ->where('lavertia.locale', 'ar')
            ->etc());
});
