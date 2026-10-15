<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\LavertiaDemoProfile;
use Illuminate\Support\Facades\Gate;
use Inertia\Testing\AssertableInertia as Assert;

it('requires authentication for the model-backed page', function (): void {
    $this->get('/admin/model-demo')->assertRedirect(route('login'));
});

it('only returns the current user in a scoped, server-paginated table', function (): void {
    $user = User::factory()->create(['name' => 'Visible User']);
    User::factory()->create(['name' => 'Another User']);

    $this->actingAs($user)->get('/admin/model-demo')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('lavertia/page')
            ->where('lavertia.tree.components.1.type', 'table')
            ->where('lavertia.tree.components.1.props.mode', 'eloquent')
            ->where('lavertia.tree.components.1.props.pagination.total', 1)
            ->where('lavertia.tree.components.1.props.rows.0.name', 'Visible User')
            ->missing('lavertia.tree.components.1.props.rows.0.password')
            ->etc());
});

it('supports Arabic locale and RTL direction on Lavertia pages', function (): void {
    $this->actingAs(User::factory()->create())
        ->get('/admin/dashboard?lang=ar')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('lavertia/page')
            ->where('lavertia.locale', 'ar')
            ->where('lavertia.direction', 'rtl')
            ->where('lavertia.tree.components.0.props.title', 'نظرة عامة')
            ->etc());
});

it('requires auth before accepting a demo profile submission', function (): void {
    $this->post('/admin/demo-profile', [
        'display_name' => 'Guest',
        'role' => 'editor',
        'notify' => '0',
    ])->assertRedirect(route('login'));
});

it('validates form input and never mass assigns untrusted user identifiers', function (): void {
    $user = User::factory()->create();
    $other = User::factory()->create();

    $this->actingAs($user)->post('/admin/demo-profile', [
        'display_name' => 'Sara',
        'role' => 'owner',
        'bio' => 'Working on Lavertia',
        'notify' => '1',
        'user_id' => $other->id,
        'is_admin' => true,
    ])->assertRedirect();

    $this->assertDatabaseHas('lavertia_demo_profiles', [
        'user_id' => $user->id,
        'display_name' => 'Sara',
        'role' => 'owner',
        'notify' => 1,
    ]);
    $this->assertDatabaseMissing('lavertia_demo_profiles', ['user_id' => $other->id]);
});

it('rejects invalid form values and does not write a demo profile', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)->post('/admin/demo-profile', [
        'display_name' => '',
        'role' => 'super-admin',
        'bio' => str_repeat('x', 1001),
        'notify' => 'unexpected',
    ])->assertSessionHasErrors(['display_name', 'role', 'bio', 'notify']);

    $this->assertDatabaseCount('lavertia_demo_profiles', 0);
});

it('updates the same user-scoped record instead of creating duplicates', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)->post('/admin/demo-profile', [
        'display_name' => 'First',
        'role' => 'editor',
        'bio' => '',
        'notify' => '0',
    ])->assertRedirect();

    $this->actingAs($user)->post('/admin/demo-profile', [
        'display_name' => 'Updated',
        'role' => 'owner',
        'bio' => 'New value',
        'notify' => '1',
    ])->assertRedirect();

    $this->assertDatabaseCount('lavertia_demo_profiles', 1);
    $this->assertDatabaseHas('lavertia_demo_profiles', [
        'user_id' => $user->id,
        'display_name' => 'Updated',
        'role' => 'owner',
        'notify' => 1,
    ]);
});

it('serializes only the signed-in users saved profile into the form', function (): void {
    $user = User::factory()->create();
    $other = User::factory()->create();

    $user->lavertiaDemoProfile()->create([
        'display_name' => 'Visible profile',
        'role' => 'editor',
        'bio' => 'A private biography',
        'notify' => false,
    ]);
    $other->lavertiaDemoProfile()->create([
        'display_name' => 'Hidden profile',
        'role' => 'owner',
        'bio' => 'Do not leak this',
        'notify' => true,
    ]);

    $this->actingAs($user)->get('/admin/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('lavertia.tree.components.3.components.0.type', 'form')
            ->where('lavertia.tree.components.3.components.0.props.action', '/admin/demo-profile')
            ->where('lavertia.tree.components.3.components.0.components.0.props.value', 'Visible profile')
            ->where('lavertia.tree.components.3.components.0.components.2.props.value', 'A private biography')
            ->missing('lavertia.tree.components.3.components.0.components.0.props.user_id')
            ->etc());
});

it('refuses updates to a demo profile owned by another user', function (): void {
    $user = User::factory()->create();
    $other = User::factory()->create();

    $profile = $other->lavertiaDemoProfile()->create([
        'display_name' => 'Protected data',
        'role' => 'owner',
        'notify' => true,
    ]);

    $this->actingAs($user);

    expect(Gate::allows('update', $profile))->toBeFalse();
    expect(Gate::allows('create', LavertiaDemoProfile::class))->toBeTrue();

    $this->post('/admin/demo-profile', [
        'user_id' => $other->getKey(),
        'display_name' => 'My own profile',
        'role' => 'editor',
        'notify' => '0',
    ])->assertRedirect();

    $this->assertDatabaseHas('lavertia_demo_profiles', [
        'id' => $profile->getKey(),
        'display_name' => 'Protected data',
        'role' => 'owner',
    ]);
});

it('requires verified email for demo profile changes', function (): void {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)->post('/admin/demo-profile', [
        'display_name' => 'Attempt',
        'role' => 'editor',
        'notify' => '0',
    ])->assertRedirect(route('verification.notice'));

    $this->assertDatabaseCount('lavertia_demo_profiles', 0);
});

it('supports explicit patch and put submissions with Laravel validation', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)->patch('/admin/demo-profile', [
        'display_name' => 'Patched',
        'role' => 'editor',
        'notify' => '0',
    ])->assertRedirect();

    $this->assertDatabaseHas('lavertia_demo_profiles', [
        'user_id' => $user->getKey(),
        'display_name' => 'Patched',
        'role' => 'editor',
    ]);

    $this->actingAs($user)->put('/admin/demo-profile', [
        'display_name' => 'Replaced',
        'role' => 'owner',
        'notify' => '1',
    ])->assertRedirect();

    $this->assertDatabaseCount('lavertia_demo_profiles', 1);
    $this->assertDatabaseHas('lavertia_demo_profiles', [
        'user_id' => $user->getKey(),
        'display_name' => 'Replaced',
        'role' => 'owner',
        'notify' => 1,
    ]);
});
