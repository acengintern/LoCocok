<?php

$dir = 'app/Http/Requests/';

$req1 = <<<'EOD'
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
EOD;

$req2 = <<<'EOD'
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
EOD;

$req3 = <<<'EOD'
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\PaymentStatus;

class UpdateProjectPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => 'sometimes|required|numeric|min:0',
            'payment_date' => 'nullable|date',
            'status' => ['sometimes', 'required', Rule::enum(PaymentStatus::class)],
            'notes' => 'nullable|string',
        ];
    }
}
EOD;

$req4 = <<<'EOD'
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\CostType;

class StoreProjectCostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'cost_type' => ['required', Rule::enum(CostType::class)],
            'incurred_at' => 'nullable|date',
        ];
    }
}
EOD;

$req5 = <<<'EOD'
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\CostType;

class UpdateProjectCostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'description' => 'sometimes|required|string|max:255',
            'amount' => 'sometimes|required|numeric|min:0',
            'cost_type' => ['sometimes', 'required', Rule::enum(CostType::class)],
            'incurred_at' => 'nullable|date',
        ];
    }
}
EOD;

file_put_contents($dir.'UpdateProjectFinancialRequest.php', $req1);
file_put_contents($dir.'StoreProjectPaymentRequest.php', $req2);
file_put_contents($dir.'UpdateProjectPaymentRequest.php', $req3);
file_put_contents($dir.'StoreProjectCostRequest.php', $req4);
file_put_contents($dir.'UpdateProjectCostRequest.php', $req5);
