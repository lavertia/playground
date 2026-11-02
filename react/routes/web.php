<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

// Standalone, non-Panel Lavertia Pages. Host middleware remains authoritative.
// Public SEO requires an enabled Inertia SSR deployment for crawlable HTML.
Route::middleware('web')->group(function (): void {
    Route::get('lavertia-demo', \App\Lavertia\PublicPages\AboutLavertiaPage::class)
        ->name('lavertia.public.demo');
    Route::get('lavertia-demo/split', \App\Lavertia\PublicPages\SplitDemoPage::class)
        ->name('lavertia.public.split');
});

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
    });

Route::middleware(['auth'])->group(function () {
    Route::post('admin/notifications/{notification}/read', \App\Http\Controllers\MarkPanelNotificationReadController::class)
        ->name('lavertia.notifications.read');
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';
