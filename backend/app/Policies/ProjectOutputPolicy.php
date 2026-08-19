<?php

namespace App\Policies;

use App\Models\ProjectOutput;
use App\Models\Project;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProjectOutputPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user, Project $project): bool
    {
        return $user->can('view', $project);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ProjectOutput $projectOutput): bool
    {
        return $user->can('view', $projectOutput->project);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Project $project): bool
    {
        return $user->can('update', $project);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ProjectOutput $projectOutput): bool
    {
        return $user->can('update', $projectOutput->project);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ProjectOutput $projectOutput): bool
    {
        return $user->can('update', $projectOutput->project);
    }
}
