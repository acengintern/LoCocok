<?php

namespace App\Http\Controllers;

use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    public function index(): JsonResponse
    {
        $roles = Role::with('permissions')->get();

        return $this->successResponse($roles, 'Roles retrieved successfully.');
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'nullable|array',
        ]);

        $role = Role::create([
            'name' => $request->name,
            'guard_name' => 'web',
        ]);

        if ($request->filled('permissions')) {
            $perms = Permission::whereIn('id', (array) $request->permissions)
                ->orWhereIn('name', (array) $request->permissions)
                ->get();
            $role->syncPermissions($perms);
        }

        return $this->successResponse($role->load('permissions'), 'Role created successfully.', 201);
    }

    public function show(Role $role): JsonResponse
    {
        return $this->successResponse($role->load('permissions'), 'Role retrieved successfully.');
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'permissions' => 'nullable|array',
        ]);

        if (strtolower($role->name) === 'system administrator' && strtolower($request->name) !== 'system administrator') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot rename the System Administrator role.',
            ], 422);
        }

        $role->update(['name' => $request->name]);

        if ($request->has('permissions')) {
            $perms = Permission::whereIn('id', (array) $request->permissions)
                ->orWhereIn('name', (array) $request->permissions)
                ->get();
            $role->syncPermissions($perms);
        }

        return $this->successResponse($role->load('permissions'), 'Role updated successfully.');
    }

    public function destroy(Role $role): JsonResponse
    {
        if (strtolower($role->name) === 'system administrator') {
            return response()->json([
                'success' => false,
                'message' => 'System Administrator role cannot be deleted.',
            ], 422);
        }

        $role->delete();

        return $this->successResponse(null, 'Role deleted successfully.');
    }

    public function assignPermission(Request $request, Role $role): JsonResponse
    {
        $request->validate([
            'permission_id' => 'nullable',
            'permission_name' => 'nullable',
        ]);

        if (strtolower($role->name) === 'system administrator') {
            return response()->json([
                'success' => false,
                'message' => 'System Administrator permissions cannot be modified.',
            ], 422);
        }

        $permission = null;
        if ($request->filled('permission_id')) {
            $permission = Permission::where('id', $request->permission_id)->first();
        } elseif ($request->filled('permission_name')) {
            $permission = Permission::where('name', $request->permission_name)->first();
        }

        if (!$permission) {
            return response()->json([
                'success' => false,
                'message' => 'Permission not found.',
            ], 404);
        }

        $role->givePermissionTo($permission);

        return $this->successResponse($role->load('permissions'), 'Permission assigned successfully.');
    }

    public function revokePermission(Role $role, $permissionId): JsonResponse
    {
        if (strtolower($role->name) === 'system administrator') {
            return response()->json([
                'success' => false,
                'message' => 'System Administrator permissions cannot be modified.',
            ], 422);
        }

        $permission = is_numeric($permissionId)
            ? Permission::where('id', $permissionId)->first()
            : Permission::where('name', $permissionId)->first();

        if (!$permission) {
            return response()->json([
                'success' => false,
                'message' => 'Permission not found.',
            ], 404);
        }

        $role->revokePermissionTo($permission);

        return $this->successResponse($role->load('permissions'), 'Permission revoked successfully.');
    }

    public function syncPermissions(Request $request, Role $role): JsonResponse
    {
        $request->validate([
            'permissions' => 'present|array',
        ]);

        if (strtolower($role->name) === 'system administrator') {
            return response()->json([
                'success' => false,
                'message' => 'System Administrator permissions cannot be modified.',
            ], 422);
        }

        $perms = Permission::whereIn('id', (array) $request->permissions)
            ->orWhereIn('name', (array) $request->permissions)
            ->get();

        $role->syncPermissions($perms);

        return $this->successResponse($role->load('permissions'), 'Permissions synchronized successfully.');
    }
}