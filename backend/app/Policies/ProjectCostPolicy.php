<?php

namespace App\Policies;

use App\Models\ProjectCost;
use App\Models\User;

class ProjectCostPolicy
{
    public function manage(User $user, ProjectCost $projectCost = null): bool
    {
        return $user->hasPermissionTo('manage');
    }
}