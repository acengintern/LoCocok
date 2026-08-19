<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\PaymentStatus;

class StoreProjectPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'nullable|date',
            'status' => ['required', Rule::enum(PaymentStatus::class)],
            'notes' => 'nullable|string',
        ];
    }
}