<?php

namespace App\Policies;

use App\Models\Script;
use App\Models\Project;
use App\Models\User;

class ScriptPolicy
{
    public function viewAny(User $user, Project $project): bool
    {
        return $user->can('view', $project);
    }

    public function view(User $user, Script $script): bool
    {
        return $user->can('view', $script->project);
    }

    public function create(User $user, Project $project): bool
    {
        return $user->can('update', $project);
    }

    public function update(User $user, Script $script): bool
    {
        return $user->can('update', $script->project);
    }

    public function delete(User $user, Script $script): bool
    {
        return $user->can('update', $script->project);
    }
}
