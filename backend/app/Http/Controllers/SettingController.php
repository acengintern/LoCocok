<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $settings = Setting::all()->pluck('value', 'key');

        return $this->successResponse($settings, 'Settings retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'settings' => ['required', 'array'],
        ]);

        foreach ($request->input('settings') as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return $this->successResponse(null, 'Settings updated successfully');
    }
}
