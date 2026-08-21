<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

class SettingController extends Controller
{
    use ApiResponse;

    protected array $allowedKeys = [
        'agency_name',
        'contact_email',
        'currency',
    ];

    public function index(): JsonResponse
    {
        $settings = Cache::rememberForever('system_settings', function () {
            return Setting::all()->pluck('value', 'key')->toArray();
        });

        return $this->successResponse($settings, 'Settings retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'settings' => ['required', 'array'],
            'settings.agency_name' => ['nullable', 'string', 'max:255'],
            'settings.contact_email' => ['nullable', 'email', 'max:255'],
            'settings.currency' => ['nullable', 'string', 'max:10'],
        ]);

        $settings = $request->input('settings');
        $unknownKeys = array_diff(array_keys($settings), $this->allowedKeys);

        if (!empty($unknownKeys)) {
            throw ValidationException::withMessages([
                'settings' => ['Invalid setting key(s): ' . implode(', ', $unknownKeys)],
            ]);
        }

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        Cache::forget('system_settings');

        return $this->successResponse(null, 'Settings updated successfully');
    }
}
