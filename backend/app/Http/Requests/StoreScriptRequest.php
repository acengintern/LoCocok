<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\ScriptStatus;
class StoreScriptRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'content_plan_id' => 'nullable|exists:content_plans,id',
            'title' => 'required|string|max:255',
            'content_type' => 'nullable|string|max:255',
            'hook' => 'nullable|string',
            'concept' => 'nullable|string',
            'script_text' => 'nullable|string',
            'reference' => 'nullable|string',
            'talent' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'cta' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'status' => ['nullable', Rule::enum(ScriptStatus::class)],
        ];
    }
}