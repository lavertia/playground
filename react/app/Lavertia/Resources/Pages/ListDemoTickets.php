<?php

declare(strict_types=1);

namespace App\Lavertia\Resources\Pages;

use App\Lavertia\Resources\DemoTicketResource;
use Illuminate\Database\Eloquent\Builder;
use Lavertia\Panels\Components\Action;
use Lavertia\Panels\Resources\ListRecords;
use Lavertia\Panels\Resources\Tabs\Tab;
use Lavertia\Tables\Components\Table;
use Lavertia\Tables\Components\TextColumn;

final class ListDemoTickets extends ListRecords
{
    public static function resource(): string
    {
        return DemoTicketResource::class;
    }

    public static function resourceAction(): string
    {
        return 'list';
    }

    protected function tableName(): string
    {
        return 'demo-tickets';
    }

    protected function listTitle(): string
    {
        return (string) $this->pageParameter('heading', 'Demo Tickets');
    }

    protected function listDescription(): ?string
    {
        return 'Records are scoped by the server to the current user and team.';
    }

    protected function table(Table $table): Table
    {
        return $table
            ->label('Owner-scoped tickets')
            ->columns([
                TextColumn::make('id')->label('ID'),
                TextColumn::make('title')->label('Title'),
                TextColumn::make('status')->label('Status'),
            ])
            ->searchable();
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('create-ticket')
                ->label('Create preview')
                ->url(DemoTicketResource::getUrl('create', panelId: 'admin')),
        ];
    }

    protected function modifyTableQuery(Builder $query): void
    {
        $status = $this->pageParameter('status');

        if (is_string($status) && in_array($status, ['draft', 'published'], true)) {
            $query->where('status', $status);
        }

        // Do not let arbitrary tab/query parameters broaden the base query.
        $query->select(['id', 'title', 'status']);
    }

    /**
     * Filament-style filter tabs, independent of the Page registration aliases.
     * Query, badges and authorization are evaluated on the Laravel server.
     */
    protected function getTabs(): array
    {
        if ($this->pageParameter('status') !== null) {
            return [];
        }

        return [
            'all' => Tab::make('All tickets')->icon('list'),
            'published' => Tab::make('Published')
                ->icon('check-circle')
                ->modifyQueryUsing(static fn (Builder $query) => $query->where('status', 'published'))
                ->badge(static fn (): int => DemoTicketResource::query()->where('status', 'published')->count())
                ->badgeColor('success'),
            'drafts' => Tab::make('Drafts')
                ->icon('archive')
                ->modifyQueryUsing(static fn (Builder $query) => $query->where('status', 'draft'))
                ->badge(static fn (): int => DemoTicketResource::query()->where('status', 'draft')->count())
                ->badgeColor('warning'),
        ];
    }

    protected function getDefaultActiveTab(): ?string
    {
        return 'all';
    }
}
