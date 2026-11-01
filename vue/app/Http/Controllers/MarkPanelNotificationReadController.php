<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class MarkPanelNotificationReadController
{
    public function __invoke(Request $request, string $notification): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user !== null, 403);

        // Resolve through the current user's own polymorphic relation.
        $record = $user->notifications()->findOrFail($notification);
        $record->markAsRead();

        return back();
    }
}
