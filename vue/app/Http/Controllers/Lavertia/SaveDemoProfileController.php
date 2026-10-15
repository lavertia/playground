<?php

declare(strict_types=1);

namespace App\Http\Controllers\Lavertia;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

final class SaveDemoProfileController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'display_name' => ['required', 'string', 'max:100'],
            'role' => ['required', Rule::in(['owner', 'editor'])],
            'bio' => ['nullable', 'string', 'max:1000'],
            'notify' => ['required', 'boolean'],
        ]);

        // Scope the mutation through the authenticated user's relationship.
        // Never trust a user_id or arbitrary model attributes from the payload.
        $request->user()->lavertiaDemoProfile()->updateOrCreate([], [
            'display_name' => $validated['display_name'],
            'role' => $validated['role'],
            'bio' => $validated['bio'] ?? null,
            'notify' => (bool) $validated['notify'],
        ]);

        return back()->with('status', 'lavertia-demo-profile-saved');
    }
}
