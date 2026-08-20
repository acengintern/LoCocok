<?php

namespace App\Http\Controllers;

use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    public function index(): JsonResponse
    {
        $roles = Role::with('permissions')->get();

        return $this->successResponse($roles, 'Roles retrieved successfully.');
    }
}
