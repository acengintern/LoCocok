<?php

namespace App\Policies;

use App\Models\ProjectPayment;
use App\Models\User;

class ProjectPaymentPolicy
{
    public function manage(User $user, ProjectPayment $projectPayment = null): bool
    {
        return $user->hasPermissionTo('manage');
    }
}