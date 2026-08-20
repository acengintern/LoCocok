<?php

namespace App\Policies;

use App\Models\FileVersion;
use App\Models\Project;
use App\Models\User;

class FileVersionPolicy
{
    private function canManageOrIsAssigned(User $user, Project $project): bool
    {
        return in_array($user->id, [
            $project->ae_id,
            $project->sms_id,
            $project->cd_id,
        ]);
    }

    public function view(User $user, FileVersion $fileVersion): bool
    {
        return $user->can('view', $fileVersion->file->project);
    }

    public function update(User $user, FileVersion $fileVersion): bool
    {
        return $this->canManageOrIsAssigned($user, $fileVersion->file->project);
    }

    public function delete(User $user, FileVersion $fileVersion): bool
    {
        return $this->canManageOrIsAssigned($user, $fileVersion->file->project);
    }
}
