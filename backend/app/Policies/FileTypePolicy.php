<?php

namespace App\Policies;

use App\Models\FileType;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class FileTypePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool {
        return $user->can('view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, FileType $model): bool {
        return $user->can('view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool {
        return $user->can('manage');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, FileType $model): bool {
        return $user->can('manage');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, FileType $model): bool {
        return $user->can('manage');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, FileType $model): bool {
        return $user->can('manage');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, FileType $model): bool {
        return $user->can('manage');
    }
}

