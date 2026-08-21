# Task 1: Backend Package Installation, Database Migration, and Services Config

## Task Details
**Files:**
- Modify: `backend/composer.json`
- Create: `backend/database/migrations/2026_08_21_000000_add_google_id_and_avatar_to_users_table.php`
- Modify: `backend/config/services.php`
- Modify: `backend/app/Models/User.php`

**Requirements:**
1. Install `laravel/socialite` in `backend` via composer: `composer require laravel/socialite`
2. Create migration `2026_08_21_000000_add_google_id_and_avatar_to_users_table.php` adding `google_id` (nullable, unique), `avatar` (nullable), and making `password` nullable.
3. Configure `google` entry in `config/services.php`.
4. Run `php artisan migrate`.
5. Run existing tests `php artisan test` to ensure 0 regressions.
6. Commit: `git commit -am "feat(auth): install socialite, add google_id and avatar migration, configure google services"`
7. Report back.
