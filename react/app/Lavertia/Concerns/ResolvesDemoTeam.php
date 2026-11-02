<?php

declare(strict_types=1);

namespace App\Lavertia\Concerns;

use App\Models\User;
use Illuminate\Support\Facades\Auth;

trait ResolvesDemoTeam
{
    /**
     * Every demo table read must be anchored to a currently authorized team.
     * An untrusted current_team_id assignment alone is not sufficient.
     */
    protected function activeDemoTeamId(): int
    {
        $user = Auth::user();

        abort_unless($user instanceof User && $user->current_team_id !== null, 403);

        $teamId = (int) $user->current_team_id;

        abort_unless(
            $user->teamMemberships()->where('team_id', $teamId)->exists(),
            403,
        );

        return $teamId;
    }
}
