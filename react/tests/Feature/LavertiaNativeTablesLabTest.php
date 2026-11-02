<?php

declare(strict_types=1);

use App\Enums\TeamRole;
use App\Lavertia\Models\DemoOrder;
use App\Lavertia\Models\DemoPost;
use App\Lavertia\Models\DemoProduct;
use App\Models\User;
use Database\Seeders\DemoTablesSeeder;
use Illuminate\Support\Facades\Artisan;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();
});

it('shows only Users belonging to the current authorized team and server-filters their role', function (): void {
    $owner = User::factory()->create();
    $colleague = User::factory()->create();
    $outsider = User::factory()->create();

    $owner->currentTeam->members()->attach($colleague, ['role' => TeamRole::Admin->value]);

    $this->actingAs($owner)
        ->get('/admin/filament-tables-lab?lvt_lab-users_filter_role=admin')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.1.components.0.props.appliedFilters.role', 'admin')
            ->where('lavertia.tree.components.1.components.0.props.pagination.total', 1)
            ->where('lavertia.tree.components.1.components.0.props.rows.0.email', $colleague->email)
            ->missing('lavertia.tree.components.1.components.0.props.rows.0.password')
            ->etc());

    $this->get('/admin/filament-tables-lab?lvt_lab-users_search='.$outsider->email)
        ->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.1.components.0.props.pagination.total', 0)
            ->etc());
});

it('validates verification presence filters with allowlisted values', function (): void {
    $owner = User::factory()->create();
    $colleague = User::factory()->unverified()->create();
    $owner->currentTeam->members()->attach($colleague, ['role' => TeamRole::Member->value]);

    $this->actingAs($owner)->get('/admin/filament-tables-lab?lvt_lab-users_filter_email_verified_at=no')
        ->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.1.components.0.props.pagination.total', 1)
            ->where('lavertia.tree.components.1.components.0.props.rows.0.email', $colleague->email)
            ->etc());
});

it('scopes posts to current team and supports server-selected status tabs', function (): void {
    $owner = User::factory()->create();
    $other = User::factory()->create();

    foreach (['published', 'draft'] as $i => $status) {
        DemoPost::query()->create([
            'team_id' => $owner->current_team_id,
            'author_id' => $owner->getKey(),
            'title' => 'Test post '.$i,
            'slug' => 'test-post-'.$i,
            'status' => $status,
            'featured' => $i === 0,
        ]);
    }

    DemoPost::query()->create([
        'team_id' => $other->current_team_id,
        'author_id' => $other->getKey(),
        'title' => 'Secret post',
        'slug' => 'secret-post',
        'status' => 'published',
        'featured' => true,
    ]);

    $this->actingAs($owner)
        ->get('/admin/filament-tables-lab?lvt_lab-posts_tab=published')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.2.components.0.props.appliedTab', 'published')
            ->where('lavertia.tree.components.2.components.0.props.pagination.total', 1)
            ->where('lavertia.tree.components.2.components.0.props.rows.0.title', 'Test post 0')
            ->where('lavertia.tree.components.2.components.0.props.rows.0.author', $owner->name)
            ->missing('lavertia.tree.components.2.components.0.props.rows.0.team_id')
            ->etc());
});

it('correctly paginates orders and computes totals for all matching rows, not the first page', function (): void {
    $owner = User::factory()->create();
    $other = User::factory()->create();

    for ($i = 0; $i < 17; $i++) {
        DemoOrder::query()->create([
            'team_id' => $owner->current_team_id,
            'number' => 'OR'.str_pad((string) $i, 6, '0', STR_PAD_LEFT),
            'customer' => 'Test customer '.$i,
            'status' => $i % 2 === 0 ? 'delivered' : 'processing',
            'total_price' => '100.00',
            'shipping_cost' => '10.00',
            'order_date' => '2026-11-02',
        ]);
    }

    DemoOrder::query()->create([
        'team_id' => $other->current_team_id,
        'number' => 'PRIVATE01',
        'customer' => 'Hidden customer',
        'status' => 'delivered',
        'total_price' => '999999.00',
        'shipping_cost' => '9999.00',
        'order_date' => '2026-11-02',
    ]);

    $this->actingAs($owner)
        ->get('/admin/commerce-tables-lab?lvt_lab-orders_perPage=5&lvt_lab-orders_page=2')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.3.components.0.props.pagination.total', 17)
            ->where('lavertia.tree.components.3.components.0.props.pagination.perPage', 5)
            ->where('lavertia.tree.components.3.components.0.props.pagination.page', 2)
            ->has('lavertia.tree.components.3.components.0.props.rows', 5)
            ->where('lavertia.tree.components.3.components.0.props.summaryTotals.total_price', 1700)
            ->where('lavertia.tree.components.3.components.0.props.summaryTotals.shipping_cost', 170)
            ->etc());

    $this->get('/admin/commerce-tables-lab?lvt_lab-orders_tab=delivered&lvt_lab-orders_perPage=5')
        ->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.3.components.0.props.pagination.total', 9)
            ->where('lavertia.tree.components.3.components.0.props.summaryTotals.total_price', 900)
            ->etc());
});

it('rejects a tampered current_team_id without a real team membership', function (): void {
    $owner = User::factory()->create();
    $other = User::factory()->create();

    $owner->forceFill(['current_team_id' => $other->current_team_id])->save();

    $this->actingAs($owner)
        ->get('/admin/filament-tables-lab')
        ->assertForbidden();

    $this->get('/admin/commerce-tables-lab')->assertForbidden();
});

it('seeds isolated deterministic fixtures idempotently only in the testing environment', function (): void {
    $owner = User::factory()->create([
        'name' => 'Test User',
        'email' => 'test@example.com',
    ]);

    Artisan::call('db:seed', ['--class' => DemoTablesSeeder::class, '--force' => true]);
    Artisan::call('db:seed', ['--class' => DemoTablesSeeder::class, '--force' => true]);

    expect(DemoPost::query()->where('team_id', $owner->current_team_id)->count())->toBe(50);
    expect(DemoProduct::query()->where('team_id', $owner->current_team_id)->count())->toBe(55);
    expect(DemoOrder::query()->where('team_id', $owner->current_team_id)->count())->toBe(1011);

    $this->actingAs($owner)->get('/admin/commerce-tables-lab')
        ->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.3.components.0.props.pagination.total', 1011)
            ->has('lavertia.tree.components.3.components.0.props.rows', 10)
            ->etc());
});
