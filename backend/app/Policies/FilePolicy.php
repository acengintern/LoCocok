<?php

namespace App\Policies;

use App\Models\File;
use App\Models\Project;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class FilePolicy
{
    private function canManageOrIsAssigned(User $user, Project $project): bool
    {
        return in_array($user->id, [
            $project->ae_id,
            $project->sms_id,
            $project->cd_id,
        ]);
    }

    public function viewAny(User $user, Project $project): bool
    {
        return $user->can('view', $project);
    }

    public function view(User $user, File $file): bool
    {
        return $user->can('view', $file->project);
    }

    public function download(User $user, File $file): bool
    {
        return $user->can('view', $file->project);
    }

    public function create(User $user, Project $project): bool
    {
        if ($this->canManageOrIsAssigned($user, $project)) {
            return true;
        }

        return $project->tasks()->whereHas('assignments', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->exists();
    }

    public function update(User $user, File $file): bool
    {
        if ($this->canManageOrIsAssigned($user, $file->project)) {
            return true;
        }

        if ($file->task_id) {
            return $file->task()->whereHas('assignments', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->exists();
        }

        return false;
    }

    public function delete(User $user, File $file): bool
    {
        return $this->canManageOrIsAssigned($user, $file->project);
    }
}
