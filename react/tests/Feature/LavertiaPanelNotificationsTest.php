<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();
});

it('returns the authenticated user notifications and never another users notifications', function (): void {
    $user = User::factory()->create();
    $other = User::factory()->create();

    $user->notifications()->create([
        'id' => (string) Str::uuid(),
        'type' => 'App\\Notifications\\PanelNotice',
        'data' => ['title' => 'Welcome', 'message' => 'Your panel is ready.', 'url' => '/admin/dashboard'],
    ]);

    $other->notifications()->create([
        'id' => (string) Str::uuid(),
        'type' => 'App\\Notifications\\PanelNotice',
        'data' => ['title' => 'Private', 'message' => 'Must not be visible'],
    ]);

    $this->actingAs($user)->get('/admin/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('lavertiaNotifications', 1)
            ->where('lavertiaNotifications.0.title', 'Welcome')
            ->where('lavertiaNotifications.0.read', false)
            ->etc());
});

it('only allows the owner to mark a notification as read', function (): void {
    $owner = User::factory()->create();
    $other = User::factory()->create();

    $record = $owner->notifications()->create([
        'id' => (string) Str::uuid(),
        'type' => 'App\\Notifications\\PanelNotice',
        'data' => ['title' => 'Owned'],
    ]);

    $this->actingAs($other)->post('/admin/notifications/'.$record->id.'/read')
        ->assertNotFound();

    expect($record->fresh()->read_at)->toBeNull();

    $this->actingAs($owner)->post('/admin/notifications/'.$record->id.'/read')
        ->assertRedirect();

    expect($record->fresh()->read_at)->not->toBeNull();
});

it('redirects guests instead of exposing notification endpoints', function (): void {
    $this->post('/admin/notifications/'.Str::uuid().'/read')
        ->assertRedirect('/login');
});
