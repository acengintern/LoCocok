$policies = @(
    "TeamPolicy",
    "ProjectTypePolicy",
    "OutputTypePolicy",
    "TaskTypePolicy",
    "FileTypePolicy"
)

foreach ($policy in $policies) {
    $file = "app/Policies/$policy.php"
    $content = Get-Content $file -Raw
    
    $content = $content -replace 'public function viewAny\(User \\): bool\s*{\s*//\s*}', "public function viewAny(User $user): bool { return $user->hasPermissionTo('view'); }"
    $content = $content -replace 'public function view\(User \, [^)]+\): bool\s*{\s*//\s*}', "public function view(User $user, $model): bool { return $user->hasPermissionTo('view'); }"
    $content = $content -replace 'public function create\(User \\): bool\s*{\s*//\s*}', "public function create(User $user): bool { return $user->hasPermissionTo('manage'); }"
    $content = $content -replace 'public function update\(User \, [^)]+\): bool\s*{\s*//\s*}', "public function update(User $user, $model): bool { return $user->hasPermissionTo('manage'); }"
    $content = $content -replace 'public function delete\(User \, [^)]+\): bool\s*{\s*//\s*}', "public function delete(User $user, $model): bool { return $user->hasPermissionTo('manage'); }"
    $content = $content -replace 'public function restore\(User \, [^)]+\): bool\s*{\s*//\s*}', "public function restore(User $user, $model): bool { return $user->hasPermissionTo('manage'); }"
    $content = $content -replace 'public function forceDelete\(User \, [^)]+\): bool\s*{\s*//\s*}', "public function forceDelete(User $user, $model): bool { return $user->hasPermissionTo('manage'); }"
    
    Set-Content -Path $file -Value $content
}
