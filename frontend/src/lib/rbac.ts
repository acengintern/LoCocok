import { User, Role, Permission } from '@/types/api';

export function hasRole(user: User | null, role: string | string[]): boolean {
    if (!user || !user.roles) return false;
    const rolesToCheck = Array.isArray(role) ? role : [role];
    return user.roles.some((r: any) => {
        const roleName = typeof r === 'string' ? r : r?.name;
        return rolesToCheck.includes(roleName);
    });
}

export function hasPermission(user: User | null, permission: string | string[]): boolean {
    if (!user || !user.roles) return false;
    const permissionsToCheck = Array.isArray(permission) ? permission : [permission];
    
    // Flatten all permissions from all user roles
    const userPermissions = user.roles.reduce((acc: string[], role: Role) => {
        if (role.permissions) {
            acc.push(...role.permissions.map((p: Permission) => p.name));
        }
        return acc;
    }, []);

    // Check if user has ANY of the required permissions
    return permissionsToCheck.some(p => userPermissions.includes(p));
}
