<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\TeamRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Opt-in, non-production fixtures for testing the native Lavertia table system.
 *
 * Command: php artisan db:seed --class=DemoTablesSeeder
 * This intentionally does not run during migrations or normal user registration.
 */
final class DemoTablesSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            throw new RuntimeException('Demo table fixtures can only be seeded in local/testing.');
        }

        $owner = User::query()->where('email', 'test@example.com')->first();

        if (! $owner || ! $owner->currentTeam || ! $owner->belongsToTeam($owner->currentTeam)) {
            throw new RuntimeException('Run php artisan db:seed first to create the local Test User and team.');
        }

        $teamId = (int) $owner->currentTeam->getKey();

        DB::transaction(function () use ($teamId, $owner): void {
            $names = [
                'Dan Harrin', 'Ryan Chandler', 'Zep Fietje', 'Dennis Koch', 'Adam Weston',
                'Nora Haddad', 'Maya Saad', 'Karim Issa', 'Lina Mansour', 'Sara Nassar',
                'Rami Khoury', 'Hala Daher', 'Tarek Habib', 'Dima Saleh', 'Omar Jaber',
                'Adam Farah', 'Youssef Nasr',
            ];

            $members = [$owner];

            for ($i = 0; $i < 50; $i++) {
                $email = 'lavertia.demo.member.'.($i + 1).'@example.test';
                $member = User::query()->where('email', $email)->first();

                if ($member === null) {
                    $member = User::factory()->create([
                        'name' => $names[$i % count($names)].($i >= count($names) ? ' '.($i + 1) : ''),
                        'email' => $email,
                        'email_verified_at' => $i % 5 < 3 ? now() : null,
                        'password' => Str::random(48),
                    ]);
                }

                $role = $i % 4 === 0 ? TeamRole::Admin->value : TeamRole::Member->value;

                $member->teams()->syncWithoutDetaching([
                    $teamId => ['role' => $role],
                ]);

                $members[] = $member;
            }

            $titles = [
                'What is Lavertia?', 'Top 5 best features of Lavertia',
                'Tips for building a great Lavertia plugin', 'Customizing the UI',
                'New packages this season', 'A Deep Dive into Table Filters',
                'API Tokens for Integrations', 'Accessible Admin Interfaces',
                'Audit Trails with Model Events', 'Authorization Patterns in Panels',
            ];

            $now = now();
            $posts = [];

            for ($i = 0; $i < 50; $i++) {
                $title = $titles[$i % count($titles)];
                $posts[] = [
                    'team_id' => $teamId,
                    'author_id' => $members[$i % count($members)]->getKey(),
                    'title' => $title.($i >= count($titles) ? ' #'.(intdiv($i, count($titles)) + 1) : ''),
                    'slug' => Str::slug($title).'-'.($i + 1),
                    'status' => ['published', 'reviewing', 'draft', 'reviewing', 'published'][$i % 5],
                    'featured' => $i % 3 === 0,
                    'sort_order' => $i,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            DB::table('lavertia_demo_posts')->upsert(
                $posts,
                ['team_id', 'slug'],
                ['title', 'author_id', 'status', 'featured', 'sort_order', 'updated_at'],
            );

            $products = [];
            $names = [
                'Artisan Candle Set', 'Bamboo Hiking Boots', 'Cedar Candle Set',
                'Cedar Desk Organizer', 'Classic Wristwatch', 'Coastal Jump Rope',
                'Coastal Phone Mount', 'Copper Coaster Set', 'Cotton Baking Mat',
                'Cotton Coffee Mug', 'Canvas Tote Bag', 'Ceramic Vase',
            ];
            $brands = [
                'Hermann-Bode', 'Baumbach and Sons', 'Hettinger-Doyle',
                'Schiller and Runte', 'Berge and Sons', 'Kemmer-Gleichner',
                'Barton, Mayer and Kautzer',
            ];

            for ($i = 0; $i < 55; $i++) {
                $title = $names[$i % count($names)];

                $products[] = [
                    'team_id' => $teamId,
                    'name' => $title.($i >= count($names) ? ' #'.(intdiv($i, count($names)) + 1) : ''),
                    'slug' => Str::slug($title).'-'.($i + 1),
                    'brand' => $brands[$i % count($brands)],
                    'sku' => str_pad((string) ((89215849 + $i * 1949) % 100000000), 8, '0', STR_PAD_LEFT),
                    'visibility' => $i % 3 === 0,
                    'featured' => $i % 7 === 0,
                    'price' => round(38.75 + (($i * 67) % 370) + (($i % 7) * 0.18), 2),
                    'quantity' => ($i * 29 + 33) % 101,
                    'thumbnail' => $i % 8,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            DB::table('lavertia_demo_products')->upsert(
                $products,
                ['team_id', 'slug'],
                ['name', 'brand', 'sku', 'visibility', 'featured', 'price', 'quantity', 'thumbnail', 'updated_at'],
            );

            $customers = [
                'Leola Hermiston', 'Peter Medhurst', 'Mikayla Robel',
                'Myrtis Rosenbaum', 'Tremaine Roob', 'Mrs. Keely Wunsch Jr.',
                'Lucas Robel', 'Dr. Brooks Jakubowski PhD', 'Douglas Tillman',
            ];
            $orders = [];

            for ($i = 0; $i < 1011; $i++) {
                $orders[] = [
                    'team_id' => $teamId,
                    'number' => 'OR'.str_pad((string) (300001 + $i * 79), 6, '0', STR_PAD_LEFT),
                    'customer' => $customers[$i % count($customers)],
                    'status' => ['cancelled', 'delivered', 'shipped', 'delivered', 'delivered',
                        'processing', 'processing', 'shipped', 'delivered', 'new'][$i % 10],
                    'total_price' => round(75 + (($i * 97) % 1490) + (($i % 6) * 0.23), 2),
                    'shipping_cost' => round(12 + (($i * 39) % 485) + (($i % 5) * 0.12), 2),
                    'order_date' => sprintf('2026-%02d-%02d', 11 - intdiv($i % 330, 30), ($i % 27) + 1),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            foreach (array_chunk($orders, 250) as $chunk) {
                DB::table('lavertia_demo_orders')->upsert(
                    $chunk,
                    ['team_id', 'number'],
                    ['customer', 'status', 'total_price', 'shipping_cost', 'order_date', 'updated_at'],
                );
            }
        });
    }
}
