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
