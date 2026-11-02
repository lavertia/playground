<?php

declare(strict_types=1);

namespace App\Lavertia\Resources;

use App\Lavertia\Models\DemoTicket;
use App\Lavertia\Resources\Queries\DemoTicketQuery;
use Lavertia\Panels\Resources\Resource;

/**
 * Property-first Resource metadata; the same Page class is reused under
 * several route names with independent, immutable configuration parameters.
 */
final class DemoTicketResource extends Resource
{
    protected static ?string $slug = 'demo-tickets';

    protected static ?string $model = DemoTicket::class;

    protected static ?string $queryProvider = DemoTicketQuery::class;

    public static function pages(): array
    {
        return [
            'list' => Pages\ListDemoTickets::class,
            'published' => Pages\ListDemoTickets::route('/published')
                ->action('list')
                ->parameters(['status' => 'published', 'heading' => 'Published tickets']),
            'drafts' => Pages\ListDemoTickets::route('/drafts')
                ->action('list')
                ->parameters(['status' => 'draft', 'heading' => 'Draft tickets']),
            'create' => Pages\CreateDemoTicket::class,
            'view' => Pages\ViewDemoTicket::class,
            'edit' => Pages\EditDemoTicket::class,
            'history' => Pages\ViewDemoTicket::route('/{record}/history/{period}')
                ->action('view')
                ->parameters(['heading' => 'Ticket history']),
        ];
    }
}
