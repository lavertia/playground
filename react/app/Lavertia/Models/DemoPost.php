<?php

declare(strict_types=1);

namespace App\Lavertia\Models;

use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A demonstration CMS post, independent from production content.
 *
 * @property int $team_id
 * @property int $author_id
 */
#[Fillable(['team_id', 'author_id', 'title', 'slug', 'status', 'featured', 'sort_order'])]
final class DemoPost extends Model
{
    protected $table = 'lavertia_demo_posts';

    protected function casts(): array
    {
        return ['featured' => 'boolean', 'sort_order' => 'integer'];
    }

    /** @return BelongsTo<Team, $this> */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /** @return BelongsTo<User, $this> */
    public function authorUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function getAuthorAttribute(): ?string
    {
        return $this->authorUser?->name;
    }
}
