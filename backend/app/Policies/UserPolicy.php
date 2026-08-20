<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('System Administrator') || $user->hasRole('Super Admin')) {
            return true;
        }
        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view');
    }

    public function view(User $user, User $model): bool
    {
        return $user->id === $model->id || $user->hasPermissionTo('view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create');
    }

    public function update(User $user, User $model): bool
    {
        return $user->hasPermissionTo('edit');
    }

    public function delete(User $user, User $model): bool
    {
        return $user->hasPermissionTo('delete');
    }

    public function manageRoles(User $user): bool
    {
        // Adjust this to match your actual Spatie permission for managing roles.
        // E.g., 'manage roles' or check if the user is an admin.
        // Assuming there is an 'edit' or 'manage' permission globally. Let's use 'manage' or 'manage users'.
        // Or if Admin role bypasses everything, Spatie usually does that in AuthServiceProvider.
        return $user->hasPermissionTo('manage'); // Based on "manage permissions" in brief.
    }
}
