<?php

namespace App\Policies;

use App\Models\ContentPlan;
use App\Models\Project;
use App\Models\User;

class ContentPlanPolicy
{
    public function viewAny(User $user, Project $project): bool
    {
        return $user->can('view', $project);
    }

    public function view(User $user, ContentPlan $contentPlan): bool
    {
        return $user->can('view', $contentPlan->project);
    }

    public function create(User $user, Project $project): bool
    {
        return $user->can('update', $project);
    }

    public function update(User $user, ContentPlan $contentPlan): bool
    {
        return $user->can('update', $contentPlan->project);
    }

    public function delete(User $user, ContentPlan $contentPlan): bool
    {
        return $user->can('update', $contentPlan->project);
    }
}
