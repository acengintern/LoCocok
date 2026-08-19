<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class StoreBriefRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'brief_text' => 'nullable|string',
            'objective' => 'nullable|string',
            'platform' => 'nullable|string',
            'content_requirement' => 'nullable|string',
            'reference' => 'nullable|string',
            'deadline' => 'nullable|date',
        ];
    }
}