<?php

declare(strict_types=1);

namespace App\Lavertia\Models;

use Illuminate\Database\Eloquent\Model;

final class DemoTicket extends Model
{
    protected $table = 'lavertia_demo_tickets';

    protected $fillable = ['owner_id', 'team_id', 'title'];
}
