<?php

declare(strict_types=1);

use Lavertia\Forms\Components\Form as CanonicalForm;
use Lavertia\Panels\Components\Form as LegacyForm;
use Lavertia\Panels\Components\Table as LegacyTable;
use Lavertia\Panels\Components\TextInput;
use Lavertia\Panels\Components\TextColumn;
use Lavertia\Tables\Components\Table as CanonicalTable;

it('renders canonical standalone components from legacy Panels imports', function (): void {
    $form = LegacyForm::make('profile')
        ->components([TextInput::make('display_name')->required()]);
    $table = LegacyTable::make('accounts')
        ->columns([TextColumn::make('name')])
        ->rows([['name' => 'Alpha']]);

    expect($form)->toBeInstanceOf(CanonicalForm::class);
    expect($table)->toBeInstanceOf(CanonicalTable::class);
    expect($form->toArray()['components'][0]['type'])->toBe('text-input');
    expect($table->toArray()['props']->rows[0]->name)->toBe('Alpha');
});
