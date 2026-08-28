<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;

use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    use ApiResponse;

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        
        $identifier = $credentials['identifier'];
        $password = $credentials['password'];

        $fieldType = filter_var($identifier, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        if (Auth::attempt([$fieldType => $identifier, 'password' => $password])) {
            if ($request->hasSession()) {
                $request->session()->regenerate();
            }
            $user = Auth::user()->load('roles');
            $token = $user->createToken('auth_token')->plainTextToken;
            
            return $this->successResponse([
                'user' => new UserResource($user),
                'token' => $token,
            ], 'Login successful');
        }

        return $this->errorResponse('Invalid credentials', null, 401);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()?->currentAccessToken();
        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return $this->successResponse(null, 'Logout successful');
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('roles');
        return $this->successResponse(
            new UserResource($user),
            'User retrieved successfully'
        );
    }
}
