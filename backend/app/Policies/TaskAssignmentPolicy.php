<?php

namespace App\Policies;

use App\Models\TaskAssignment;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TaskAssignmentPolicy
{
    public function viewAny(User $user, \App\Models\Task $task): bool
    {
        return $user->can('view', $task);
    }

    public function view(User $user, TaskAssignment $taskAssignment): bool
    {
        return $user->can('view', $taskAssignment->task);
    }

    public function create(User $user, \App\Models\Task $task): bool
    {
        return $user->can('update', $task->project);
    }

    public function update(User $user, TaskAssignment $taskAssignment): bool
    {
        return $user->can('update', $taskAssignment->task->project);
    }

    public function delete(User $user, TaskAssignment $taskAssignment): bool
    {
        return $user->can('update', $taskAssignment->task->project);
    }
}
