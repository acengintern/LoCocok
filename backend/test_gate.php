<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = App\Models\User::factory()->create();
$user->assignRole('Account Executive');
$proj = App\Models\Project::factory()->create();
$fin = $proj->financial()->create();
dump(Gate::forUser($user)->allows('view', $fin));