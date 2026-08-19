<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
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
}
