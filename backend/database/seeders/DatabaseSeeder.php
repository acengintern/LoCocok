<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);
        $this->call(SettingSeeder::class);
        $this->call(MasterDataExcelSeeder::class);

        // Seed Default README Test Accounts
        $defaultAccounts = [
            [
                'name' => 'mamad',
                'email' => 'begopeoplee@gmail.com',
                'username' => 'mamad',
                'password' => 'begomad',
                'role' => 'System Administrator',
            ],
            [
                'name' => 'System Administrator',
                'email' => 'admin@locotrack.com',
                'username' => 'admin',
                'password' => 'password',
                'role' => 'System Administrator',
            ],
            [
                'name' => 'Creative Director',
                'email' => 'director@locotrack.com',
                'username' => 'director',
                'password' => 'password',
                'role' => 'Creative Director',
            ],
            [
                'name' => 'Account Executive',
                'email' => 'ae@locotrack.com',
                'username' => 'ae_user',
                'password' => 'password',
                'role' => 'Account Executive',
            ],
            [
                'name' => 'Team Member / Designer',
                'email' => 'designer@locotrack.com',
                'username' => 'designer',
                'password' => 'password',
                'role' => 'Graphic Designer',
            ],
        ];

        foreach ($defaultAccounts as $account) {
            $user = User::firstOrCreate(
                ['email' => $account['email']],
                [
                    'name' => $account['name'],
                    'username' => $account['username'],
                    'password' => Hash::make($account['password'] ?? 'password'),
                    'email_verified_at' => now(),
                ]
            );

            if (!empty($account['role'])) {
                $role = Role::firstOrCreate(['name' => $account['role'], 'guard_name' => 'web']);
                $user->syncRoles([$role]);
            }
        }
    }
}
