<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Setting;
use Database\Seeders\SettingSeeder;

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

    public function test_setting_seeder_populates_default_settings()
    {
        $this->seed(SettingSeeder::class);

        $this->assertDatabaseHas('settings', [
            'key' => 'agency_name',
            'value' => 'Loco Creative Agency',
        ]);
        $this->assertDatabaseHas('settings', [
            'key' => 'contact_email',
            'value' => 'admin@lococreative.com',
        ]);
        $this->assertDatabaseHas('settings', [
            'key' => 'currency',
            'value' => 'IDR',
        ]);
    }
}
