<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\ContentPlanStatus;
class StoreContentPlanRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'title' => 'required|string|max:255',
            'content_pillar' => 'nullable|string|max:255',
            'content_type' => 'nullable|string|max:255',
            'ideation' => 'nullable|string',
            'caption' => 'nullable|string',
            'platform' => 'nullable|string|max:255',
            'posting_date' => 'nullable|date',
            'reference' => 'nullable|string',
            'notes' => 'nullable|string',
            'status' => ['nullable', Rule::enum(ContentPlanStatus::class)],
            'output_type_id' => 'nullable|exists:output_types,id',
        ];
    }
}