<?php

namespace App\Http\Controllers;

use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    public function index(): JsonResponse
    {
        $permissions = Permission::orderBy('name')->get();

        return $this->successResponse($permissions, 'Permissions retrieved successfully.');
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name',
        ]);

        $permission = Permission::create([
            'name' => $request->name,
            'guard_name' => 'web',
        ]);

        return $this->successResponse($permission, 'Permission created successfully.', 201);
    }

    public function show(Permission $permission): JsonResponse
    {
        return $this->successResponse($permission, 'Permission retrieved successfully.');
    }

    public function update(Request $request, Permission $permission): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name,' . $permission->id,
        ]);

        $permission->update(['name' => $request->name]);

        return $this->successResponse($permission, 'Permission updated successfully.');
    }

    public function destroy(Permission $permission): JsonResponse
    {
        $permission->delete();

        return $this->successResponse(null, 'Permission deleted successfully.');
    }
}