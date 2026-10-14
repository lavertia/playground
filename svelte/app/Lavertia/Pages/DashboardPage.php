<?php

declare(strict_types=1);

namespace App\Lavertia\Pages;

use Lavertia\Panels\Components\Action;
use Lavertia\Panels\Components\Infolist;
use Lavertia\Panels\Components\Table;
use Lavertia\Panels\Components\TextColumn;
use Lavertia\Panels\Components\TextEntry;
use Lavertia\Panels\Components\TextInput;
use Lavertia\Panels\Pages\Page;
use Lavertia\Support\Components\Card;
use Lavertia\Support\Components\Text;
use Lavertia\Support\Contracts\Component;

final class DashboardPage extends Page
{
    public static function slug(): string
    {
        return 'dashboard';
    }

    /**
     * @return list<Component>
     */
    protected function components(): array
    {
        return [
            Text::make('Welcome to Lavertia'),

            Card::make([
                Infolist::make('company')
                    ->components([
                        TextEntry::make('name')
                            ->label('Company')
                            ->value('Fenix Software'),
                    ]),

                Table::make('users')
                    ->columns([
                        TextColumn::make('name')
                            ->label('Name'),

                        TextColumn::make('email')
                            ->label('Email'),
                    ])
                    ->rows([
                        [
                            'name' => 'Mostafa',
                            'email' => 'mostafa@example.com',
                        ],
                        [
                            'name' => 'Ahmad',
                            'email' => 'ahmad@example.com',
                        ],
                    ]),

                TextInput::make('notes')
                    ->label('Demo Input')
                    ->placeholder('Type something...'),

                Action::make('home')
                    ->label('Back to Home')
                    ->url('/'),
            ]),
        ];
    }
}
