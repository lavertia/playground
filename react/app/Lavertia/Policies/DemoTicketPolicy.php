<?php

declare(strict_types=1);

namespace App\Lavertia\Policies;

use App\Lavertia\Models\DemoTicket;
use App\Models\User;

final class DemoTicketPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function view(User $user, DemoTicket $ticket): bool
    {
        return $this->ownsTicket($user, $ticket);
    }

    public function update(User $user, DemoTicket $ticket): bool
    {
        return $this->ownsTicket($user, $ticket);
    }

    private function ownsTicket(User $user, DemoTicket $ticket): bool
    {
        return (int) $ticket->owner_id === (int) $user->getAuthIdentifier()
            && $ticket->team_id === $user->current_team_id;
    }
}
