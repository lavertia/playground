<?php

declare(strict_types=1);

namespace App\Lavertia\Resources\Pages;

use App\Lavertia\Resources\DemoTicketResource;
use Lavertia\Panels\Components\PageHeader;
use Lavertia\Panels\Components\Section;
use Lavertia\Panels\Pages\SplitPage;
use Lavertia\Panels\Resources\InteractsWithResource;
use Lavertia\Panels\Resources\ResourcePageContract;

final class EditDemoTicket extends SplitPage implements ResourcePageContract
{
    use InteractsWithResource;

    public static function resource(): string
    {
        return DemoTicketResource::class;
    }

    public static function resourceAction(): string
    {
        return 'edit';
    }

    protected function leftComponents(): array
    {
        return [
            PageHeader::make('Edit '.$this->record()->title),
            Section::make('Edit presentation only')
                ->description('No POST/PATCH route is registered by this demo.'),
        ];
    }

    protected function rightComponents(): array
    {
        return [
            Section::make('Record inspector')
                ->description('A second region composed with normal Lavertia widgets.'),
        ];
    }
}
