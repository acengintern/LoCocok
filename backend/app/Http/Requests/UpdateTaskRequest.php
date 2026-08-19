<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'task_no' => ['sometimes', 'string', 'max:255', 'unique:tasks,task_no,'.$this->route('task')->id],
            'description' => ['nullable', 'string'],
            'status' => ['sometimes', \Illuminate\Validation\Rule::enum(\App\Enums\TaskStatus::class)],
            'priority' => ['sometimes', \Illuminate\Validation\Rule::enum(\App\Enums\Priority::class)],
            'due_date' => ['nullable', 'date'],
            'task_type_id' => ['sometimes', 'exists:task_types,id'],
            'output_type_id' => ['nullable', 'exists:output_types,id'],
        ];
    }
}
