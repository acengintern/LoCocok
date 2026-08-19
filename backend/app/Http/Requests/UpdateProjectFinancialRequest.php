<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectFinancialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_revenue' => 'numeric|min:0',
            'sales_commission' => 'numeric|min:0',
            'cost_of_sale' => 'numeric|min:0',
            'ppn' => 'numeric|min:0',
            'pph' => 'numeric|min:0',
            'nett_project_revenue' => 'numeric|min:0',
            'hpp' => 'numeric|min:0',
            'working_budget_production' => 'numeric|min:0',
            'working_budget_creative' => 'numeric|min:0',
        ];
    }
}