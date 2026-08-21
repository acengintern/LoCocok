# System Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a Key-Value Store System Settings module to manage global agency configurations like name, email, and currency via backend API and frontend UI.

**Architecture:** A Laravel Eloquent model `Setting` handles DB interactions, `SettingController` handles REST API requests protected by Sanctum and Spatie Permissions. Next.js `SettingsClient` fetches and updates the settings.

**Tech Stack:** Next.js (App Router), Tailwind CSS, React, Laravel 11, SQLite/MySQL, Spatie Permissions.

## Global Constraints

- Laravel API responses must use standard `{ success, data, message, meta }` format via the `ApiResponse` trait.
- Settings are globally accessible but mutation is restricted to the "System Administrator" role.
- Adhere strictly to the Next.js `SettingsClient` layout structure.

---

### Task 1: Backend Database Migration, Model, and Seeder

**Files:**
- Create: `backend/database/migrations/YYYY_MM_DD_HHMMSS_create_settings_table.php` (timestamp dynamically generated)
- Create: `backend/app/Models/Setting.php`
- Create: `backend/database/seeders/SettingSeeder.php`
- Modify: `backend/database/seeders/DatabaseSeeder.php`
- Create: `backend/tests/Feature/SettingApiTest.php`

**Interfaces:**
- Produces: `Setting` Eloquent model with `$fillable = ['key', 'value', 'type']`

- [ ] **Step 1: Write the failing test**

```php
// backend/tests/Feature/SettingApiTest.php
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Setting;

class SettingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_setting_model_exists_and_can_be_seeded()
    {
        $setting = Setting::create([
            'key' => 'agency_name',
            'value' => 'Loco Creative',
            'type' => 'string'
        ]);

        $this->assertDatabaseHas('settings', [
            'key' => 'agency_name',
            'value' => 'Loco Creative'
        ]);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && php artisan test --filter test_setting_model_exists_and_can_be_seeded`
Expected: FAIL (Class App\Models\Setting not found or table 'settings' doesn't exist)

- [ ] **Step 3: Write minimal implementation**

Run: `cd backend && php artisan make:model Setting -m`

```php
// backend/app/Models/Setting.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'type'];
}
```

```php
// backend/database/migrations/xxxx_xx_xx_xxxxxx_create_settings_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
```

Run: `cd backend && php artisan make:seeder SettingSeeder`

```php
// backend/database/seeders/SettingSeeder.php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        Setting::updateOrCreate(['key' => 'agency_name'], ['value' => 'Loco Creative Agency', 'type' => 'string']);
        Setting::updateOrCreate(['key' => 'contact_email'], ['value' => 'admin@lococreative.com', 'type' => 'string']);
        Setting::updateOrCreate(['key' => 'currency'], ['value' => 'IDR', 'type' => 'string']);
    }
}
```

Modify `backend/database/seeders/DatabaseSeeder.php` to include `$this->call(SettingSeeder::class);` within the `run()` method.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && php artisan migrate:fresh --seed`
Run: `cd backend && php artisan test --filter test_setting_model_exists_and_can_be_seeded`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/database backend/app/Models/Setting.php backend/tests
git commit -m "feat(backend): create settings model, migration, and seeder"
```

---

### Task 2: Backend API Controller and Routes

**Files:**
- Create: `backend/app/Http/Controllers/SettingController.php`
- Modify: `backend/routes/api.php`
- Modify: `backend/tests/Feature/SettingApiTest.php`

**Interfaces:**
- Consumes: `App\Models\Setting`
- Produces: `GET /api/v1/settings` and `POST /api/v1/settings` endpoints

- [ ] **Step 1: Write the failing test**

```php
// Add to backend/tests/Feature/SettingApiTest.php
    public function test_can_get_and_update_settings_via_api()
    {
        $user = \App\Models\User::factory()->create();
        $role = \Spatie\Permission\Models\Role::create(['name' => 'System Administrator']);
        $user->assignRole($role);
        
        \App\Models\Setting::create(['key' => 'agency_name', 'value' => 'Old Name']);

        // GET
        $response = $this->actingAs($user)->getJson('/api/v1/settings');
        $response->assertStatus(200)
                 ->assertJsonPath('data.agency_name', 'Old Name');

        // POST
        $response = $this->actingAs($user)->postJson('/api/v1/settings', [
            'settings' => [
                'agency_name' => 'New Name',
                'currency' => 'USD'
            ]
        ]);
        $response->assertStatus(200);

        $this->assertDatabaseHas('settings', ['key' => 'agency_name', 'value' => 'New Name']);
        $this->assertDatabaseHas('settings', ['key' => 'currency', 'value' => 'USD']);
    }
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && php artisan test --filter test_can_get_and_update_settings_via_api`
Expected: FAIL (404 Not Found)

- [ ] **Step 3: Write minimal implementation**

```php
// backend/app/Http/Controllers/SettingController.php
<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

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
```

```php
// backend/routes/api.php
// Add inside the `Route::middleware('auth:sanctum')->group(function () {` block:
Route::get('settings', [\App\Http\Controllers\SettingController::class, 'index']);
Route::post('settings', [\App\Http\Controllers\SettingController::class, 'store'])->middleware('role:System Administrator');
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && php artisan test --filter test_can_get_and_update_settings_via_api`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/Http/Controllers/SettingController.php backend/routes/api.php backend/tests/Feature/SettingApiTest.php
git commit -m "feat(backend): implement setting api endpoints"
```

---

### Task 3: Frontend Integration

**Files:**
- Modify: `free-nextjs-admin-dashboard/src/app/(admin)/administration/settings/SettingsClient.tsx`

**Interfaces:**
- Consumes: `GET /api/v1/settings` and `POST /api/v1/settings` APIs.

- [ ] **Step 1: Write the implementation**

Update `SettingsClient.tsx` to fetch settings on mount and post them on save:

```tsx
// Replace entire file contents in free-nextjs-admin-dashboard/src/app/(admin)/administration/settings/SettingsClient.tsx
"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useToast } from "@/context/ToastContext";
import { apiClient } from "@/lib/api/client";

export default function SettingsClient() {
  const { showToast } = useToast();
  const [agencyName, setAgencyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [currency, setCurrency] = useState("IDR");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/settings");
      if (res.data?.data) {
        const data = res.data.data;
        if (data.agency_name) setAgencyName(data.agency_name);
        if (data.contact_email) setContactEmail(data.contact_email);
        if (data.currency) setCurrency(data.currency);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.post("/settings", {
        settings: {
          agency_name: agencyName,
          contact_email: contactEmail,
          currency: currency,
        }
      });
      showToast({
        variant: "success",
        title: "Settings Saved",
        message: "System configuration updated successfully.",
      });
    } catch (error) {
      showToast({
        variant: "error",
        title: "Settings Failed",
        message: "Failed to update configuration.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            System Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Global agency parameters, security baselines, and workspace preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Agency Profile */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Agency Profile & Workspace
          </h2>
          <div className="space-y-3">
            <div>
              <Label>Agency Name</Label>
              <Input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
              />
            </div>
            <div>
              <Label>Administrative Contact Email</Label>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>Primary Currency</Label>
              <select
                className="h-11 w-full rounded-xl border border-gray-200 bg-transparent px-3.5 py-2.5 text-sm text-gray-800 dark:border-gray-800 dark:text-white/90 focus:border-brand-500 focus:outline-none"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="IDR" className="dark:bg-gray-900">IDR (Indonesian Rupiah - Rp)</option>
                <option value="USD" className="dark:bg-gray-900">USD (US Dollar - $)</option>
                <option value="SGD" className="dark:bg-gray-900">SGD (Singapore Dollar - S$)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: Security & Governance */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Security & RBAC Enforcement
          </h2>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.01]">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">System Admin Protection</p>
                <p className="text-xs text-gray-500">Immutable superadmin permissions</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.01]">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Sanctum Token Auth</p>
                <p className="text-xs text-gray-500">Session guard & API token authentication</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400">
                ENABLED
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.01]">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Activity Audit Logging</p>
                <p className="text-xs text-gray-500">Auto-tracks models & permission changes</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400">
                ENABLED
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={saving} className="bg-brand-500 hover:bg-brand-600 text-white">
          {saving ? "Saving Changes..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run test to verify it passes**

Run: `cd free-nextjs-admin-dashboard && npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add free-nextjs-admin-dashboard/src/app/\(admin\)/administration/settings/SettingsClient.tsx
git commit -m "feat(frontend): integrate system settings with api"
```
