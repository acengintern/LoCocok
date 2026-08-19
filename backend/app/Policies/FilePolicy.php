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
        if ($user->hasPermissionTo('manage')) {
            return true;
        }

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
        return $this->canManageOrIsAssigned($user, $project);
    }

    public function update(User $user, File $file): bool
    {
        return $this->canManageOrIsAssigned($user, $file->project);
    }

    public function delete(User $user, File $file): bool
    {
        return $this->canManageOrIsAssigned($user, $file->project);
    }
}
