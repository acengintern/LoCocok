<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorized via policy
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'task_no' => ['required', 'string', 'max:255', 'unique:tasks,task_no'],
            'description' => ['nullable', 'string'],
            'status' => ['required', \Illuminate\Validation\Rule::enum(\App\Enums\TaskStatus::class)],
            'priority' => ['required', \Illuminate\Validation\Rule::enum(\App\Enums\Priority::class)],
            'due_date' => ['nullable', 'date'],
            'task_type_id' => ['required', 'exists:task_types,id'],
            'output_type_id' => ['nullable', 'exists:output_types,id'],
        ];
    }
}
