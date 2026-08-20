<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view');
    }

    public function view(User $user, Project $project): bool
    {
        if (! $user->hasPermissionTo('view')) {
            return false;
        }

        if ($user->hasPermissionTo('manage')) {
            return true;
        }

        if ($this->canManageOrIsAssigned($user, $project)) {
            return true;
        }

        return $project->tasks()->whereHas('assignments', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->exists();
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create');
    }

    public function update(User $user, Project $project): bool
    {
        return $this->canManageOrIsAssigned($user, $project);
    }

    public function delete(User $user, Project $project): bool
    {
        return $this->canManageOrIsAssigned($user, $project);
    }

    public function restore(User $user, Project $project): bool
    {
        return $this->canManageOrIsAssigned($user, $project);
    }

    public function forceDelete(User $user, Project $project): bool
    {
        return $this->canManageOrIsAssigned($user, $project);
    }

    private function canManageOrIsAssigned(User $user, Project $project): bool
    {
        if ($user->hasPermissionTo('manage')) {
            return true;
        }

        return $user->id === $project->ae_id
            || $user->id === $project->sms_id
            || $user->id === $project->cd_id;
    }
}
