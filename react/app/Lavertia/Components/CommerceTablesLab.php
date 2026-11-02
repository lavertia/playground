<?php

declare(strict_types=1);

namespace App\Lavertia\Components;

use Lavertia\Support\Components\AbstractComponent;

/**
 * Deterministic, fictitious Commerce fixtures for Filament-style UI regression tests.
 *
 * This is not an Eloquent repository or a product/order API. Every mutation
 * in the React laboratory changes browser state only.
 */
final class CommerceTablesLab extends AbstractComponent
{
    public static function make(): self
    {
        return (new self)->key('commerce-tables-lab');
    }

    public function getType(): string
    {
        return 'commerce-tables-lab';
    }

    /** @return array<string, mixed> */
    public function getProps(): array
    {
        $productNames = [
            'Artisan Candle Set', 'Bamboo Hiking Boots', 'Cedar Candle Set',
            'Cedar Desk Organizer', 'Classic Wristwatch', 'Coastal Jump Rope',
            'Coastal Phone Mount', 'Copper Coaster Set', 'Cotton Baking Mat',
            'Cotton Coffee Mug', 'Canvas Tote Bag', 'Ceramic Vase',
            'Leather Wallet', 'Wooden Desk Lamp', 'Travel Notebook',
        ];
        $brands = [
            'Hermann-Bode', 'Baumbach and Sons', 'Hettinger-Doyle',
            'Schiller, Kshlerin and Runte', 'Berge and Sons',
            'Kemmer-Gleichner', 'Barton, Mayer and Kautzer',
        ];
        $products = [];

        for ($i = 0; $i < 55; $i++) {
            $title = $productNames[$i % count($productNames)];
            $products[] = [
                'id' => $i + 1,
                'name' => $i >= count($productNames)
                    ? $title.' #'.(intdiv($i, count($productNames)) + 1)
                    : $title,
                'slug' => strtolower(trim((string) preg_replace('/[^a-zA-Z0-9]+/', '-', $title), '-')).'-'.($i + 1),
                'brand' => $brands[$i % count($brands)],
                'price' => round(38.75 + (($i * 67) % 370) + (($i % 7) * 0.18), 2),
                'compare_at_price' => round(55 + (($i * 71) % 390), 2),
                'cost_per_item' => round(20 + (($i * 27) % 110), 2),
                'quantity' => ($i * 29 + 33) % 101,
                'security_stock' => ($i % 6) + 4,
                'sku' => str_pad((string) ((89215849 + $i * 1949) % 100000000), 8, '0', STR_PAD_LEFT),
                'barcode' => 'EAN'.str_pad((string) ($i + 1), 10, '0', STR_PAD_LEFT),
                'description' => 'Fictitious product fixture. No inventory changes are saved.',
                'visibility' => $i % 3 === 0,
                'featured' => $i % 7 === 0,
                'backorder' => $i % 8 === 0,
                'requires_shipping' => $i % 6 !== 0,
                'published_at' => '2026-'.str_pad((string) (($i % 10) + 1), 2, '0', STR_PAD_LEFT).'-'.str_pad((string) (($i % 27) + 1), 2, '0', STR_PAD_LEFT),
                'thumbnail' => $i % 8,
            ];
        }

        $customers = [
            'Leola Hermiston', 'Peter Medhurst', 'Mikayla Robel',
            'Myrtis Rosenbaum', 'Tremaine Roob', 'Mrs. Keely Wunsch Jr.',
            'Lucas Robel', 'Dr. Brooks Jakubowski PhD', 'Douglas Tillman',
            'Bessie Christiansen', 'Nicholas Dare', 'Floyd Ward',
            'Jerome Smitham', 'Dima Saleh', 'Omar Jaber',
        ];
        $statuses = [
            'cancelled', 'delivered', 'shipped', 'delivered', 'delivered',
            'processing', 'processing', 'shipped', 'delivered', 'new',
        ];
        $orders = [];

        for ($i = 0; $i < 1011; $i++) {
            $orders[] = [
                'id' => $i + 1,
                'number' => 'OR'.str_pad((string) (300001 + $i * 79), 6, '0', STR_PAD_LEFT),
                'customer' => $customers[$i % count($customers)],
                'status' => $statuses[$i % count($statuses)],
                'total_price' => round(75 + (($i * 97) % 1490) + (($i % 6) * 0.23), 2),
                'shipping_cost' => round(12 + (($i * 39) % 485) + (($i % 5) * 0.12), 2),
                'order_date' => '2026-'.str_pad((string) (11 - (intdiv($i % 330, 30))), 2, '0', STR_PAD_LEFT).'-'.str_pad((string) (($i % 27) + 1), 2, '0', STR_PAD_LEFT),
            ];
        }

        return [
            'products' => $products,
            'orders' => $orders,
            'demoOnly' => true,
            'locale' => app()->getLocale(),
        ];
    }
}
