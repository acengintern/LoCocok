<?php

namespace App\Http\Requests;

use App\Enums\Priority;
use App\Enums\ProjectStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Handled by policy
    }

    public function rules(): array
    {
        return [
            'project_code' => ['nullable', 'string', 'max:255'],
            'client_id' => ['required', 'exists:clients,id'],
            'name' => ['required', 'string', 'max:255'],
            'project_type_id' => ['required', 'exists:project_types,id'],
            'ae_id' => ['nullable', 'exists:users,id'],
            'sms_id' => ['nullable', 'exists:users,id'],
            'cd_id' => ['nullable', 'exists:users,id'],
            'priority' => ['nullable', Rule::enum(Priority::class)],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'actual_end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'status' => ['nullable', Rule::enum(ProjectStatus::class)],
            'notes' => ['nullable', 'string'],
        ];
    }
}
