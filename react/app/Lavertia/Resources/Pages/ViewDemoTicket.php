<?php

declare(strict_types=1);

namespace App\Lavertia\Resources\Pages;

use App\Lavertia\Resources\DemoTicketResource;
use Lavertia\Panels\Components\Infolist;
use Lavertia\Panels\Components\PageHeader;
use Lavertia\Panels\Components\TextEntry;
use Lavertia\Panels\Pages\CardPage;
use Lavertia\Panels\Resources\InteractsWithResource;
use Lavertia\Panels\Resources\ResourcePageContract;

final class ViewDemoTicket extends CardPage implements ResourcePageContract
{
    use InteractsWithResource;

    public static function resource(): string
    {
        return DemoTicketResource::class;
    }

    public static function resourceAction(): string
    {
        return 'view';
    }

    protected function components(): array
    {
        $record = $this->record();

        $period = $this->routeParameter('period');
        $heading = (string) $this->pageParameter('heading', 'View ticket');

        return [
            PageHeader::make($period === null ? $heading : $heading.' ('.$period.')'),
            Infolist::make('ticket')->components([
                TextEntry::make('title')->label('Title')->value((string) $record->title),
                TextEntry::make('id')->label('Record')->value((string) $record->getKey()),
            ]),
        ];
    }
}
