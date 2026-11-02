<?php

declare(strict_types=1);

namespace App\Lavertia\Resources\Pages;

use App\Lavertia\Models\DemoTicket;
use App\Lavertia\Resources\DemoTicketResource;
use Illuminate\Support\Facades\Gate;
use Lavertia\Panels\Components\Action;
use Lavertia\Panels\Components\PageHeader;
use Lavertia\Panels\Components\Section;
use Lavertia\Panels\Components\Table;
use Lavertia\Panels\Components\TextColumn;
use Lavertia\Panels\Resources\ResourcePage;

final class ListDemoTickets extends ResourcePage
{
    public static function resource(): string
    {
        return DemoTicketResource::class;
    }

    public static function resourceAction(): string
    {
        return 'list';
    }

    protected function components(): array
    {
        $status = $this->pageParameter('status');
        $heading = (string) $this->pageParameter('heading', 'Demo Tickets');

        return [
            PageHeader::make($heading)
                ->description('Eloquent records scoped to the signed-in user and active team.')
                ->actions([
                    Action::make('create-ticket')
                        ->label('Create preview')
                        ->url('/admin/demo-tickets/create'),
                ]),
            Section::make($heading)->components([
                Table::make('demo-tickets')
                    ->label('Owner-scoped tickets')
                    ->columns([
                        TextColumn::make('id')->label('ID'),
                        TextColumn::make('title')->label('Title'),
                        TextColumn::make('status')->label('Status'),
                    ])
                    ->eloquent(
                        DemoTicketResource::query()
                            ->when($status !== null, static fn ($query) => $query->where('status', $status))
                            ->select(['id', 'title', 'status']),
                        static fn (): bool => Gate::allows('viewAny', DemoTicket::class),
                    ),
            ]),
        ];
    }
}
