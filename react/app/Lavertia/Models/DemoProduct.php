<?php

declare(strict_types=1);

namespace App\Lavertia\Models;

use App\Models\Team;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Demo inventory model: never use this as a production inventory ledger. */
#[Fillable(['team_id', 'name', 'slug', 'brand', 'sku', 'visibility', 'featured', 'price', 'quantity', 'thumbnail'])]
final class DemoProduct extends Model
{
    protected $table = 'lavertia_demo_products';

    protected function casts(): array
    {
        return [
            'visibility' => 'boolean',
            'featured' => 'boolean',
            'price' => 'decimal:2',
            'quantity' => 'integer',
            'thumbnail' => 'integer',
        ];
    }

    /** @return BelongsTo<Team, $this> */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }
}
