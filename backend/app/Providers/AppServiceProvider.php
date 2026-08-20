<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::before(function ($user, $ability) {
            return ($user->hasRole('System Administrator') || $user->hasRole('Super Admin')) ? true : null;
        });

        Gate::define('view-dashboard', function ($user) {
            return true;
        });

        Gate::policy(\Illuminate\Notifications\DatabaseNotification::class, \App\Policies\NotificationPolicy::class);
    }
}
