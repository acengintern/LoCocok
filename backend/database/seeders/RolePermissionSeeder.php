<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            'view',
            'create',
            'edit',
            'delete',
            'assign',
            'upload',
            'approve',
            'publish',
            'export',
            'manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Define roles and their basic logical permissions
        $rolePermissions = [
            'System Administrator' => $permissions,
            'Creative Director' => ['view', 'create', 'edit', 'delete', 'assign', 'upload', 'approve', 'publish'],
            'Account Executive' => ['view', 'create', 'edit', 'upload', 'export'],
            'Social Media Specialist' => ['view', 'create', 'edit', 'upload', 'publish'],
            'Graphic Designer' => ['view', 'create', 'edit', 'upload'],
            'Video Editor / DAV' => ['view', 'create', 'edit', 'upload'],
            'KOL' => ['view', 'upload'],
            'Production Assistant' => ['view', 'create', 'edit', 'upload'],
        ];

        foreach ($rolePermissions as $roleName => $rolePerms) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            $role->syncPermissions($rolePerms);
        }
    }
}
