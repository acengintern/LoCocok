<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'username' => 'nullable|string|max:255|unique:users,username',
            'password' => 'required|string|min:8',
            'role' => 'nullable|string|exists:roles,name',
            'status' => ['nullable', \Illuminate\Validation\Rule::enum(\App\Enums\UserStatus::class)],
        ];
    }
}
