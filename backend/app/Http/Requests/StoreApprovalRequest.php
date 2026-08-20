<?php

namespace App\Http\Requests;

use App\Enums\ApprovalStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreApprovalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization is handled in the controller
    }

    public function rules(): array
    {
        return [
            'status' => ['required', new Enum(ApprovalStatus::class)],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
