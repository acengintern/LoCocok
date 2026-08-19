php artisan make:controller Api/V1/TeamController --api --model=Team
php artisan make:controller Api/V1/ProjectTypeController --api --model=ProjectType
php artisan make:controller Api/V1/OutputTypeController --api --model=OutputType
php artisan make:controller Api/V1/TaskTypeController --api --model=TaskType
php artisan make:controller Api/V1/FileTypeController --api --model=FileType

php artisan make:request StoreTeamRequest
php artisan make:request UpdateTeamRequest
php artisan make:request StoreProjectTypeRequest
php artisan make:request UpdateProjectTypeRequest
php artisan make:request StoreOutputTypeRequest
php artisan make:request UpdateOutputTypeRequest
php artisan make:request StoreTaskTypeRequest
php artisan make:request UpdateTaskTypeRequest
php artisan make:request StoreFileTypeRequest
php artisan make:request UpdateFileTypeRequest

php artisan make:resource MasterDataResource

php artisan make:policy TeamPolicy --model=Team
php artisan make:policy ProjectTypePolicy --model=ProjectType
php artisan make:policy OutputTypePolicy --model=OutputType
php artisan make:policy TaskTypePolicy --model=TaskType
php artisan make:policy FileTypePolicy --model=FileType

php artisan make:test MasterDataApiTest
