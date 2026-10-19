<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\LavertiaDemoProfile;
use App\Models\User;

final class LavertiaDemoProfilePolicy
{
    public function create(User $user): bool
    {
        return $user->exists;
    }

    public function update(User $user, LavertiaDemoProfile $profile): bool
    {
        return $profile->user_id === $user->getKey();
    }
}
