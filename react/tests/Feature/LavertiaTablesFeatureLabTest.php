<?php

declare(strict_types=1);

use App\Lavertia\Models\DemoPost;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();
});

function featureLabPosts(User $owner, int $count): void
{
    for ($i = 1; $i <= $count; $i++) {
        DemoPost::query()->create([
            'team_id' => $owner->current_team_id,
            'author_id' => $owner->getKey(),
            'title' => 'Feature article '.$i,
            'slug' => 'feature-article-'.$i,
            'status' => ['draft', 'reviewing', 'published'][$i % 3],
            'featured' => $i % 5 === 0,
            'sort_order' => $i,
        ]);
    }
}

it('requires an authenticated user to explore native tables', function (): void {
    $this->get('/admin/tables-feature-lab')->assertRedirect('/login');
});

it('contains all 28 named experiments and a PHP-defined bounded snapshot table', function (): void {
    $this->actingAs(User::factory()->create())
        ->get('/admin/tables-feature-lab')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('lavertia/page')
            ->where('lavertia.title', 'Tables Feature Lab')
            ->where('lavertia.tree.components.1.type', 'tables-feature-lab')
            ->where('lavertia.tree.components.1.props.active', 1)
            ->has('lavertia.tree.components.1.props.catalog', 28)
            ->where('lavertia.tree.components.1.props.catalog.0.title', 'Defining table columns')
            ->where('lavertia.tree.components.1.props.catalog.27.title', 'Global settings')
            ->where('lavertia.tree.components.1.props.databaseReady', false)
            ->where('lavertia.tree.components.1.components.0.type', 'table')
            ->where('lavertia.tree.components.1.components.0.props.mode', 'snapshot')
            ->has('lavertia.tree.components.1.components.0.props.rows', 45)
            ->etc());
});

it('demonstrates native pushColumns instead of replacing existing columns', function (): void {
    $this->actingAs(User::factory()->create())
        ->get('/admin/tables-feature-lab?feature=4')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.1.props.active', 4)
            ->where('lavertia.tree.components.1.components.0.components.7.props.name', 'created_at')
            ->where('lavertia.tree.components.1.components.0.components.7.type', 'text-column')
            ->etc());
});

it('uses actual simple pagination without a total count', function (): void {
    $owner = User::factory()->create();
    featureLabPosts($owner, 31);

    $this->actingAs($owner)
        ->get('/admin/tables-feature-lab?feature=12&lvt_feature-explorer_perPage=5')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.1.props.databaseReady', true)
            ->where('lavertia.tree.components.1.components.0.props.paginationMode', 'simple')
            ->where('lavertia.tree.components.1.components.0.props.mode', 'eloquent')
            ->where('lavertia.tree.components.1.components.0.props.pagination.total', null)
            ->where('lavertia.tree.components.1.components.0.props.pagination.lastPage', null)
            ->where('lavertia.tree.components.1.components.0.props.pagination.hasMorePages', true)
            ->has('lavertia.tree.components.1.components.0.props.rows', 5)
            ->etc());
});

it('enforces default pagination and allowed options on forged query strings', function (): void {
    $owner = User::factory()->create();
    featureLabPosts($owner, 34);

    $this->actingAs($owner)
        ->get('/admin/tables-feature-lab?feature=8&lvt_feature-explorer_perPage=9999')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.1.components.0.props.pagination.perPage', 25)
            ->has('lavertia.tree.components.1.components.0.props.rows', 25)
            ->etc());

    $this->get('/admin/tables-feature-lab?feature=9&lvt_feature-explorer_perPage=100')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.1.components.0.props.pagination.perPage', 10)
            ->where('lavertia.tree.components.1.components.0.props.paginationOptions', [10, 25])
            ->etc());
});

it('never sends unbounded payloads when pagination is disabled', function (): void {
    $owner = User::factory()->create();
    featureLabPosts($owner, 114);

    $this->actingAs($owner)
        ->get('/admin/tables-feature-lab?feature=14')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.1.components.0.props.paginationEnabled', false)
            ->where('lavertia.tree.components.1.components.0.props.pagination.truncated', true)
            ->has('lavertia.tree.components.1.components.0.props.rows', 100)
            ->etc());
});

it('only resolves clickable record URLs and details for an authorized team', function (): void {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    featureLabPosts($owner, 1);
    featureLabPosts($other, 1);

    $owned = DemoPost::query()->where('team_id', $owner->current_team_id)->firstOrFail();
    $foreign = DemoPost::query()->where('team_id', $other->current_team_id)->firstOrFail();

    $this->actingAs($owner)
        ->get('/admin/tables-feature-lab?feature=15&record='.$owned->getKey())
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.1.props.selectedRecord.slug', $owned->slug)
            ->where('lavertia.tree.components.1.components.0.props.rows.0.__recordUrl',
                '/admin/tables-feature-lab?feature=15&record='.$owned->getKey())
            ->etc());

    $this->get('/admin/tables-feature-lab?feature=15&record='.$foreign->getKey())
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.1.props.selectedRecord', null)
            ->where('lavertia.tree.components.1.components.0.props.pagination.total', 1)
            ->etc());
});

it('renders striping, semantic row tones and real polling configuration', function (): void {
    $owner = User::factory()->create();
    featureLabPosts($owner, 2);

    $this->actingAs($owner)->get('/admin/tables-feature-lab?feature=26')
        ->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.1.components.0.props.striped', true)
            ->etc());

    $this->get('/admin/tables-feature-lab?feature=27')
        ->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.1.components.0.props.recordTones.field', 'status')
            ->where('lavertia.tree.components.1.components.0.props.recordTones.tones.published', 'success')
            ->etc());

    $this->get('/admin/tables-feature-lab?feature=20')
        ->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.1.components.0.props.pollIntervalMs', 10000)
            ->etc());
});

it('persists per-page size only when explicitly enabled on the table', function (): void {
    $owner = User::factory()->create();
    featureLabPosts($owner, 31);

    $this->actingAs($owner)->get('/admin/tables-feature-lab?feature=24&lvt_feature-explorer_perPage=25')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.1.components.0.props.pagination.perPage', 25)
            ->etc());

    $this->get('/admin/tables-feature-lab?feature=24')->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.1.components.0.props.pagination.perPage', 25)
            ->etc());

    $this->get('/admin/tables-feature-lab?feature=10')->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.1.components.0.props.pagination.perPage', 10)
            ->etc());
});

it('retains server-provided RTL and a scoped Eloquent table on first response', function (): void {
    $owner = User::factory()->create();
    featureLabPosts($owner, 1);

    $this->actingAs($owner)->get('/admin/tables-feature-lab?lang=ar&feature=3')
        ->assertOk()
        ->assertSee('lang="ar" dir="rtl"', false)
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.direction', 'rtl')
            ->where('lavertia.tree.components.1.components.0.props.rows.0.author', $owner->name)
            ->etc());
});
