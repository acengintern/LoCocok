<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $this->route('user')->id,
            'username' => 'sometimes|required|string|max:255|unique:users,username,' . $this->route('user')->id,
            'password' => 'nullable|string|min:8',
            'status' => ['nullable', \Illuminate\Validation\Rule::enum(\App\Enums\UserStatus::class)],
        ];
    }
}
