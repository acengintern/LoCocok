<?php
$policies = [
    "TeamPolicy",
    "ProjectTypePolicy",
    "OutputTypePolicy",
    "TaskTypePolicy",
    "FileTypePolicy"
];

foreach ($policies as $policy) {
    $file = "app/Policies/" . $policy . ".php";
    $content = file_get_contents($file);
    
    $content = preg_replace('/public function viewAny\(User \$user\): bool\s*{\s*\/\/\s*}/', "public function viewAny(User \$user): bool {\n        return \$user->can('view');\n    }", $content);
    $content = preg_replace('/public function view\(User \$user, ([a-zA-Z0-9_]+) \$[a-zA-Z0-9_]+\): bool\s*{\s*\/\/\s*}/', "public function view(User \$user, $1 \$model): bool {\n        return \$user->can('view');\n    }", $content);
    $content = preg_replace('/public function create\(User \$user\): bool\s*{\s*\/\/\s*}/', "public function create(User \$user): bool {\n        return \$user->can('manage');\n    }", $content);
    $content = preg_replace('/public function update\(User \$user, ([a-zA-Z0-9_]+) \$[a-zA-Z0-9_]+\): bool\s*{\s*\/\/\s*}/', "public function update(User \$user, $1 \$model): bool {\n        return \$user->can('manage');\n    }", $content);
    $content = preg_replace('/public function delete\(User \$user, ([a-zA-Z0-9_]+) \$[a-zA-Z0-9_]+\): bool\s*{\s*\/\/\s*}/', "public function delete(User \$user, $1 \$model): bool {\n        return \$user->can('manage');\n    }", $content);
    $content = preg_replace('/public function restore\(User \$user, ([a-zA-Z0-9_]+) \$[a-zA-Z0-9_]+\): bool\s*{\s*\/\/\s*}/', "public function restore(User \$user, $1 \$model): bool {\n        return \$user->can('manage');\n    }", $content);
    $content = preg_replace('/public function forceDelete\(User \$user, ([a-zA-Z0-9_]+) \$[a-zA-Z0-9_]+\): bool\s*{\s*\/\/\s*}/', "public function forceDelete(User \$user, $1 \$model): bool {\n        return \$user->can('manage');\n    }", $content);
    
    file_put_contents($file, $content);
}
