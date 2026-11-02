<?php

declare(strict_types=1);

namespace App\Lavertia\Resources\Pages;

use App\Lavertia\Resources\DemoTicketResource;
use Lavertia\Panels\Components\PageHeader;
use Lavertia\Panels\Components\Section;
use Lavertia\Panels\Pages\FlatPage;
use Lavertia\Panels\Resources\InteractsWithResource;
use Lavertia\Panels\Resources\ResourcePageContract;

final class CreateDemoTicket extends FlatPage implements ResourcePageContract
{
    use InteractsWithResource;

    public static function resource(): string
    {
        return DemoTicketResource::class;
    }

    public static function resourceAction(): string
    {
        return 'create';
    }

    protected function components(): array
    {
        return [
            PageHeader::make('Create ticket — preview'),
            Section::make('No mutation endpoint')
                ->description('This GET Page is authorized, but saving requires a real Form Request, action and transaction.'),
        ];
    }
}
