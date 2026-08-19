<?php

namespace App\Policies;

use App\Models\Brief;
use App\Models\Project;
use App\Models\User;

class BriefPolicy
{
    public function viewAny(User $user, Project $project): bool
    {
        return $user->can('view', $project);
    }

    public function view(User $user, Brief $brief): bool
    {
        return $user->can('view', $brief->project);
    }

    public function create(User $user, Project $project): bool
    {
        return $user->can('update', $project);
    }

    public function update(User $user, Brief $brief): bool
    {
        return $user->can('update', $brief->project);
    }

    public function delete(User $user, Brief $brief): bool
    {
        return $user->can('update', $brief->project);
    }
}
