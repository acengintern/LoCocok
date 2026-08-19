<?php

namespace App\Policies;

use App\Models\ProjectFinancial;
use App\Models\User;

class ProjectFinancialPolicy
{
    public function manage(User $user, ProjectFinancial $projectFinancial = null): bool
    {
        return $user->hasPermissionTo('manage');
    }
}