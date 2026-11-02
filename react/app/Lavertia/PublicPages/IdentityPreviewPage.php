<?php

declare(strict_types=1);

namespace App\Lavertia\PublicPages;

use Lavertia\Panels\Auth\AuthPageContract;
use Lavertia\Panels\Components\PageHeader;
use Lavertia\Panels\Components\Section;
use Lavertia\Panels\Pages\SplitPage;

final class IdentityPreviewPage extends SplitPage implements AuthPageContract
{
    public static function authFlow(): string
    {
        return 'login';
    }

    public static function title(): string
    {
        return 'Identity layout preview';
    }

    protected function leftComponents(): array
    {
        return [
            PageHeader::make('Independent authentication Page'),
            Section::make('Identity provider integration')
                ->description('The host owns the real Fortify login, CSRF and 2FA endpoints.'),
        ];
    }

    protected function rightComponents(): array
    {
        return [
            Section::make('Reusable SplitPage')
                ->description('The same visual Page can be mounted centrally or linked to one Panel.'),
        ];
    }
}
