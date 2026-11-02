<?php

declare(strict_types=1);

namespace App\Lavertia\Resources\Queries;

use App\Lavertia\Models\DemoTicket;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Lavertia\Panels\Resources\ResourceQueryProvider;

final class DemoTicketQuery implements ResourceQueryProvider
{
    public function query(): Builder
    {
        // Executed anew for every request, not cached in a static property.
        return DemoTicket::query()
            ->where('owner_id', Auth::id())
            ->where('team_id', Auth::user()?->current_team_id);
    }
}
