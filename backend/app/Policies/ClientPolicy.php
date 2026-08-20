<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\User;

class ClientPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Client $client): bool
    {
        if ($user->hasPermissionTo('manage')) {
            return true;
        }
        return $user->id === $client->pic_ae_id || $user->id === $client->pic_sms_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Client $client): bool
    {
        if ($user->hasPermissionTo('manage')) {
            return true;
        }
        return $user->id === $client->pic_ae_id || $user->id === $client->pic_sms_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Client $client): bool
    {
        if ($user->hasPermissionTo('manage')) {
            return true;
        }
        return $user->id === $client->pic_ae_id || $user->id === $client->pic_sms_id;
    }
}
