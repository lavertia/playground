<?php

declare(strict_types=1);

return [
    /*
    * Register pages explicitly. Your Starter Kit still owns auth and layouts.
    * Example:
    * 'panels' => [
    *     'admin' => [
    *         'path' => 'admin',
    *         'middleware' => ['web', 'auth', \Lavertia\Panels\Http\Middleware\ResolveLocale::class],
    *         'pages' => [App\Lavertia\Pages\DashboardPage::class],
    *         'navigation' => [['slug' => 'dashboard', 'label' => 'Dashboard']],
    *         'dashboard_widgets' => [],
    *         'discover_widgets' => [],
    *         'discover_pages' => [
    *             ['in' => app_path('Lavertia/Pages'), 'for' => 'App\\Lavertia\\Pages'],
    *         ],
    *     ],
    * ],
    */

    'panels' => [
        'admin' => [
            'path' => 'admin',
            'middleware' => ['web', 'auth'],
            'discover_pages' => [
                [
                    'in' => app_path('Lavertia/Pages'),
                    'for' => 'App\\Lavertia\\Pages',
                ],
            ],
            'navigation' => [
                ['slug' => 'dashboard', 'label' => 'Dashboard'],
                ['slug' => 'invoices', 'label' => 'Invoices'],
                ['slug' => 'reports', 'label' => 'Reports'],
                [
                    'slug' => 'billing/reports',
                    'label' => 'Billing Reports',
                    'group' => 'Billing',
                    'sort' => 40,
                ],
            ],
        ],
    ],
];
