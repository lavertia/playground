<?php

declare(strict_types=1);

namespace App\Lavertia\Pages;

use App\Lavertia\Concerns\ResolvesDemoTeam;
use App\Lavertia\Models\DemoOrder;
use App\Lavertia\Models\DemoProduct;
use Lavertia\Panels\Components\Action;
use Lavertia\Panels\Components\PageHeader;
use Lavertia\Panels\Components\Section;
use Lavertia\Panels\Components\Stat;
use Lavertia\Panels\Components\StatsGrid;
use Lavertia\Panels\Pages\Page;
use Lavertia\Support\Contracts\Component;
use Lavertia\Tables\Components\IconColumn;
use Lavertia\Tables\Components\ImageColumn;
use Lavertia\Tables\Components\SelectFilter;
use Lavertia\Tables\Components\Table;
use Lavertia\Tables\Components\TextColumn;

/**
 * Both commerce tables are real Eloquent Tables.
 * The 1,011 demo orders are paginated in SQL, not sent across Inertia.
 */
final class CommerceTablesLabPage extends Page
{
    use ResolvesDemoTeam;

    public static function slug(): string
    {
        return 'commerce-tables-lab';
    }

    public static function title(): string
    {
        return 'Commerce Tables Lab';
    }

    public function productsTable(Table $table, int $teamId): Table
    {
        $brandOptions = DemoProduct::query()
            ->where('team_id', $teamId)
            ->distinct()
            ->orderBy('brand')
            ->pluck('brand', 'brand')
            ->all();

        return $table
            ->label('Products')
            ->description('Real, team-scoped demo products. Filtering, sorting and pagination run in Laravel.')
            ->searchable()
            ->columnManager()
            ->reorderableColumns()
            ->groupable(['brand' => 'Brand', 'visibility' => 'Visibility'])
            ->columns([
                ImageColumn::make('thumbnail')->label('Image')->toggleable(),
                TextColumn::make('name')->label('Name')->sortable()->searchable(),
                TextColumn::make('brand')->label('Brand')->sortable(),
                IconColumn::make('visibility')->label('Visibility')->boolean()->sortable(),
                TextColumn::make('price')->label('Price')->money('USD')->sortable(),
                TextColumn::make('sku')->label('SKU')->sortable()->searchable(),
                TextColumn::make('quantity')->label('Quantity')->sortable(),
                IconColumn::make('featured')->label('Featured')->boolean()->toggleable(true, true),
            ])
            ->filters([
                SelectFilter::make('brand')->label('Brand')->options($brandOptions),
                SelectFilter::make('visibility')->label('Visibility')->options([
                    '1' => 'Visible',
                    '0' => 'Hidden',
                ]),
            ])
            ->summarize(['quantity'])
            ->eloquent(
                DemoProduct::query()->where('team_id', $teamId),
                fn (): bool => auth()->user()?->teamMemberships()->where('team_id', $teamId)->exists() === true,
                10,
            );
    }

    public function ordersTable(Table $table, int $teamId): Table
    {
        return $table
            ->label('Orders')
            ->description('Server-side pagination over 1,011 seeded orders; summary values include all matching orders.')
            ->searchable()
            ->columnManager()
            ->reorderableColumns()
            ->groupable(['status' => 'Status', 'order_date' => 'Order date'])
            ->tabs('status', [
                'new' => 'New',
                'processing' => 'Processing',
                'shipped' => 'Shipped',
                'delivered' => 'Delivered',
                'cancelled' => 'Cancelled',
            ])
            ->columns([
                TextColumn::make('number')->label('Number')->sortable()->searchable(),
                TextColumn::make('customer')->label('Customer')->sortable()->searchable(),
                TextColumn::make('status')->label('Status')->sortable()->badge([
                    'new' => 'info',
                    'processing' => 'warning',
                    'shipped' => 'success',
                    'delivered' => 'success',
                    'cancelled' => 'danger',
                ]),
                TextColumn::make('total_price')->label('Total price')->money('USD')->sortable(),
                TextColumn::make('shipping_cost')->label('Shipping cost')->money('USD')->sortable(),
                TextColumn::make('order_date')->label('Order date')->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')->label('Order status')->options([
                    'new' => 'New',
                    'processing' => 'Processing',
                    'shipped' => 'Shipped',
                    'delivered' => 'Delivered',
                    'cancelled' => 'Cancelled',
                ]),
            ])
            ->summarize(['total_price', 'shipping_cost'])
            ->eloquent(
                DemoOrder::query()->where('team_id', $teamId),
                fn (): bool => auth()->user()?->teamMemberships()->where('team_id', $teamId)->exists() === true,
                10,
            );
    }

    /** @return list<Component> */
    protected function components(): array
    {
        $teamId = $this->activeDemoTeamId();

        $products = DemoProduct::query()->where('team_id', $teamId);
        $orders = DemoOrder::query()->where('team_id', $teamId);

        return [
            PageHeader::make('Commerce Tables Lab')
                ->eyebrow('Lavertia / Native Table')
                ->description('Products and Orders now use the same reusable Lavertia Table engine as Users and Posts.')
                ->actions([
                    Action::make('users-posts')->label('Users & Posts')->appearance('outline')
                        ->url('/admin/filament-tables-lab'),
                ]),
            StatsGrid::make([
                Stat::make('Total products', (string) (clone $products)->count())->tone('primary'),
                Stat::make('Product inventory', (string) (clone $products)->sum('quantity'))->tone('neutral'),
                Stat::make('Average price', '$'.number_format((float) (clone $products)->avg('price'), 2))->tone('success'),
                Stat::make('Total orders', (string) (clone $orders)->count())->tone('primary'),
                Stat::make('Open orders', (string) (clone $orders)->whereIn('status', ['new', 'processing'])->count())->tone('warning'),
                Stat::make('Average order', '$'.number_format((float) (clone $orders)->avg('total_price'), 2))->tone('success'),
            ]),
            Section::make('01 / Products')
                ->components([$this->productsTable(Table::make('lab-products'), $teamId)]),
            Section::make('02 / Orders')
                ->components([$this->ordersTable(Table::make('lab-orders'), $teamId)]),
        ];
    }
}
