<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

final class LavertiaDemoProfile extends Model
{
    protected $fillable = ['display_name', 'role', 'bio', 'notify'];

    protected function casts(): array
    {
        return ['notify' => 'boolean'];
    }
}
