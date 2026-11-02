<?php

declare(strict_types=1);

namespace App\Lavertia\Components;

use Lavertia\Support\Components\AbstractComponent;

/**
 * Only fictional fixture records cross the Inertia boundary.
 * The table interactions are a local, non-persistent UI laboratory.
 */
final class FilamentTablesLab extends AbstractComponent
{
    public static function make(): self
    {
        return (new self)->key('filament-tables-lab');
    }

    public function getType(): string
    {
        return 'filament-tables-lab';
    }

    /** @return array<string, mixed> */
    public function getProps(): array
    {
        $names = [
            'Dan Harrin', 'Ryan Chandler', 'Zep Fietje', 'Dennis Koch', 'Adam Weston',
            'Nora Haddad', 'Maya Saad', 'Karim Issa', 'Lina Mansour', 'Sara Nassar',
            'Rami Khoury', 'Hala Daher', 'Tarek Habib', 'Dima Saleh', 'Omar Jaber',
            'Adam Farah', 'Youssef Nasr',
        ];
        $titles = [
            'What is Filament?', 'Top 5 best features of Filament',
            'Tips for building a great Filament plugin',
            "Customizing Filament's UI with a theme", 'New Filament plugins in August',
            'A Deep Dive into Table Filters', 'API Tokens for Integrations',
            'Accessible Admin Interfaces', 'Audit Trails with Model Events',
            'Authorization Patterns in Panels',
        ];

        $users = [];
        $posts = [];

        for ($i = 0; $i < 51; $i++) {
            $name = $names[$i % count($names)];
            $email = strtolower(str_replace(' ', '.', $name)).($i >= count($names) ? '.'.$i : '').'@example.test';
            $users[] = [
                'id' => $i + 1,
                'name' => $name,
                'email' => $email,
                'role' => ['Admin', 'Editor', 'Member'][$i % 3],
                'verified' => ! in_array($i % 5, [1, 2], true),
                'phone' => '+961 70 '.str_pad((string) (120000 + $i), 6, '0', STR_PAD_LEFT),
            ];

            if ($i < 50) {
                $title = $titles[$i % count($titles)];
                $posts[] = [
                    'id' => $i + 1,
                    'title' => $i >= count($titles) ? $title.' #'.(intdiv($i, count($titles)) + 1) : $title,
                    'slug' => strtolower(trim((string) preg_replace('/[^a-zA-Z0-9]+/', '-', $title), '-')).($i >= count($titles) ? '-'.$i : ''),
                    'author' => $names[$i % 5],
                    'status' => ['published', 'reviewing', 'draft', 'reviewing', 'published'][$i % 5],
                    'featured' => $i % 3 === 0,
                    'order' => $i,
                ];
            }
        }

        return [
            'users' => $users,
            'posts' => $posts,
            'locale' => app()->getLocale(),
            'demoOnly' => true,
        ];
    }
}
