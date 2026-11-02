<?php

declare(strict_types=1);

namespace App\Lavertia\Resources;

use App\Lavertia\Models\DemoTicket;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Lavertia\Panels\Resources\Resource;

final class DemoTicketResource extends Resource
{
    public static function slug(): string
    {
        return 'demo-tickets';
    }

    public static function model(): string
    {
        return DemoTicket::class;
    }

    public static function query(): Builder
    {
        // The record belongs to both the signed-in user and active team.
        // This scope is applied BEFORE route record lookup or widget serialization.
        return DemoTicket::query()
            ->where('owner_id', Auth::id())
            ->where('team_id', Auth::user()?->current_team_id);
    }

    public static function pages(): array
    {
        return [
            'list' => Pages\ListDemoTickets::class,
            'create' => Pages\CreateDemoTicket::class,
            'view' => Pages\ViewDemoTicket::class,
            'edit' => Pages\EditDemoTicket::class,
        ];
    }
}
