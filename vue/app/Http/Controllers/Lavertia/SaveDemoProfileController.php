<?php

declare(strict_types=1);

namespace App\Http\Controllers\Lavertia;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lavertia\SaveDemoProfileRequest;
use App\Models\LavertiaDemoProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

final class SaveDemoProfileController extends Controller
{
    public function __invoke(SaveDemoProfileRequest $request): RedirectResponse
    {
        $user = $request->user();
        $profile = $user->lavertiaDemoProfile;

        Gate::authorize($profile === null ? 'create' : 'update', $profile ?? LavertiaDemoProfile::class);

        $validated = $request->safe()->only(['display_name', 'role', 'bio', 'notify']);

        // updateOrCreate is constrained by the authenticated user's HasOne
        // relationship. The unique user_id database key handles racing inserts.
        $user->lavertiaDemoProfile()->updateOrCreate([], [
            'display_name' => $validated['display_name'],
            'role' => $validated['role'],
            'bio' => $validated['bio'] ?? null,
            'notify' => (bool) $validated['notify'],
        ]);

        return back()->with('status', 'lavertia-demo-profile-saved');
    }
}
