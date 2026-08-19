<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Handled by policy
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file'],
            'name' => ['required', 'string', 'max:255'],
            'task_id' => ['nullable', 'exists:tasks,id'],
            'file_type_id' => ['required', 'exists:file_types,id'],
        ];
    }
}
