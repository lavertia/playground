<?php

declare(strict_types=1);

return [
    'panels' => [
        'admin' => [
            'path' => 'admin',
            'middleware' => ['web', 'auth', \Lavertia\Panels\Http\Middleware\ResolveLocale::class],
            'pages' => [
                \App\Lavertia\Pages\DashboardPage::class,
                \App\Lavertia\Pages\InventoryOverview::class,
                \App\Lavertia\Pages\ModelDemoPage::class,
            ],
            // Plain arrays remain compatible with php artisan config:cache.
            'navigation' => [
                ['slug' => 'dashboard', 'label' => 'Dashboard', 'sort' => 0],
                ['slug' => 'inventory/overview', 'label' => 'Inventory', 'group' => 'Management', 'sort' => 10],
                ['slug' => 'model-demo', 'label' => 'Model demo', 'group' => 'Management', 'sort' => 20],
            ],
            'dashboard_widgets' => [
                \App\Lavertia\Widgets\PlaygroundInventoryWidget::class,
            ],
        ],
    ],
];
