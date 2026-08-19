<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectOutputRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'output_type_id' => 'required|exists:output_types,id',
            'name' => 'nullable|string',
            'target_quantity' => 'required|integer|min:0',
            'actual_quantity' => 'nullable|integer|min:0',
        ];
    }
}
