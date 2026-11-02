<?php

declare(strict_types=1);

namespace App\Lavertia\Models;

use App\Models\Team;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['team_id', 'number', 'customer', 'status', 'total_price', 'shipping_cost', 'order_date'])]
final class DemoOrder extends Model
{
    protected $table = 'lavertia_demo_orders';

    protected function casts(): array
    {
        return [
            'total_price' => 'decimal:2',
            'shipping_cost' => 'decimal:2',
            'order_date' => 'date',
        ];
    }

    /** @return BelongsTo<Team, $this> */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }
}
