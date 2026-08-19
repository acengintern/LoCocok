<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TaskPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function viewAnyForProject(User $user, \App\Models\Project $project): bool
    {
        return $user->can('view', $project);
    }

    public function view(User $user, Task $task): bool
    {
        return $user->can('view', $task->project);
    }

    public function create(User $user, \App\Models\Project $project): bool
    {
        return $user->can('update', $project);
    }

    public function update(User $user, Task $task): bool
    {
        if ($user->can('update', $task->project)) {
            return true;
        }

        return $task->assignments()->where('user_id', $user->id)->exists();
    }

    public function delete(User $user, Task $task): bool
    {
        return $user->can('update', $task->project);
    }
}
