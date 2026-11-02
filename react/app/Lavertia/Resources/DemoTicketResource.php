<?php

declare(strict_types=1);

namespace App\Lavertia\Resources;

use App\Lavertia\Models\DemoTicket;
use App\Lavertia\Resources\Queries\DemoTicketQuery;
use Lavertia\Panels\Resources\Resource;

/**
 * Fully property-configured Resource: no slug(), model(), pages() or query()
 * override required. The same Page class is registered with different options.
 */
final class DemoTicketResource extends Resource
{
    protected static ?string $slug = 'demo-tickets';

    protected static ?string $model = DemoTicket::class;

    protected static ?string $queryProvider = DemoTicketQuery::class;

    protected static array $pages = [
        'list' => Pages\ListDemoTickets::class,
        'published' => [
            'page' => Pages\ListDemoTickets::class,
            'route' => '/published',
            'action' => 'list',
            'parameters' => ['status' => 'published', 'heading' => 'Published tickets'],
        ],
        'drafts' => [
            'page' => Pages\ListDemoTickets::class,
            'route' => '/drafts',
            'action' => 'list',
            'parameters' => ['status' => 'draft', 'heading' => 'Draft tickets'],
        ],
        'create' => Pages\CreateDemoTicket::class,
        'view' => Pages\ViewDemoTicket::class,
        'edit' => Pages\EditDemoTicket::class,
        'history' => [
            'page' => Pages\ViewDemoTicket::class,
            'route' => '/{record}/history/{period}',
            'action' => 'view',
            'parameters' => ['heading' => 'Ticket history'],
        ],
    ];
}
