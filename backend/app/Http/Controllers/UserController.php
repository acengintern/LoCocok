<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\AssignRoleRequest;
use App\Http\Resources\UserResource;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use ApiResponse;

    public function index()
    {
        Gate::authorize('viewAny', User::class);
        $users = User::with('roles')->get();
        return $this->successResponse(UserResource::collection($users), 'Users retrieved successfully.');
    }

    public function store(StoreUserRequest $request)
    {
        Gate::authorize('create', User::class);
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);
        return $this->successResponse(new UserResource($user), 'User created successfully.', 201);
    }

    public function show(User $user)
    {
        Gate::authorize('view', $user);
        $user->load('roles');
        return $this->successResponse(new UserResource($user), 'User retrieved successfully.');
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        Gate::authorize('update', $user);
        $data = $request->validated();
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }
        $user->update($data);
        return $this->successResponse(new UserResource($user), 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        Gate::authorize('delete', $user);
        $user->delete();
        return $this->successResponse(null, 'User deleted successfully.');
    }

    // Role management endpoints
    public function getRoles(User $user)
    {
        Gate::authorize('view', $user); // Using view for reading roles
        return $this->successResponse($user->roles->pluck('name'), 'Roles retrieved successfully.');
    }

    public function assignRole(AssignRoleRequest $request, User $user)
    {
        Gate::authorize('manageRoles', User::class);
        $role = Role::where('name', $request->role)->firstOrFail();
        $user->assignRole($role);
        return $this->successResponse(null, 'Role assigned successfully.');
    }

    public function removeRole(User $user, $roleName)
    {
        Gate::authorize('manageRoles', User::class);
        $role = Role::where('name', $roleName)->firstOrFail();
        $user->removeRole($role);
        return $this->successResponse(null, 'Role removed successfully.');
    }
}
