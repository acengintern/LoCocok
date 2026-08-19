<?php

$entities = [
    [
        'model' => 'Team',
        'var' => 'team',
        'controller' => 'TeamController',
        'storeRequest' => 'StoreTeamRequest',
        'updateRequest' => 'UpdateTeamRequest'
    ],
    [
        'model' => 'ProjectType',
        'var' => 'projectType',
        'controller' => 'ProjectTypeController',
        'storeRequest' => 'StoreProjectTypeRequest',
        'updateRequest' => 'UpdateProjectTypeRequest'
    ],
    [
        'model' => 'OutputType',
        'var' => 'outputType',
        'controller' => 'OutputTypeController',
        'storeRequest' => 'StoreOutputTypeRequest',
        'updateRequest' => 'UpdateOutputTypeRequest'
    ],
    [
        'model' => 'TaskType',
        'var' => 'taskType',
        'controller' => 'TaskTypeController',
        'storeRequest' => 'StoreTaskTypeRequest',
        'updateRequest' => 'UpdateTaskTypeRequest'
    ],
    [
        'model' => 'FileType',
        'var' => 'fileType',
        'controller' => 'FileTypeController',
        'storeRequest' => 'StoreFileTypeRequest',
        'updateRequest' => 'UpdateFileTypeRequest'
    ],
];

foreach ($entities as $e) {
    $model = $e['model'];
    $var = $e['var'];
    $controller = $e['controller'];
    $storeReq = $e['storeRequest'];
    $updateReq = $e['updateRequest'];
    
    $content = <<<PHP
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\\$model;
use App\Http\Requests\\$storeReq;
use App\Http\Requests\\$updateReq;
use App\Http\Resources\MasterDataResource;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Gate;

class $controller extends Controller
{
    use ApiResponse;

    public function index()
    {
        Gate::authorize('viewAny', $model::class);
        \$items = $model::all();
        return \$this->successResponse(MasterDataResource::collection(\$items), '$model retrieved successfully.');
    }

    public function store($storeReq \$request)
    {
        Gate::authorize('create', $model::class);
        \$item = $model::create(\$request->validated());
        return \$this->successResponse(new MasterDataResource(\$item), '$model created successfully.', 201);
    }

    public function show($model \$$var)
    {
        Gate::authorize('view', \$$var);
        return \$this->successResponse(new MasterDataResource(\$$var), '$model retrieved successfully.');
    }

    public function update($updateReq \$request, $model \$$var)
    {
        Gate::authorize('update', \$$var);
        \$__VAR__->update(\$request->validated());
        return \$this->successResponse(new MasterDataResource(\$$var), '$model updated successfully.');
    }

    public function destroy($model \$$var)
    {
        Gate::authorize('delete', \$$var);
        \$__VAR__->delete();
        return \$this->successResponse(null, '$model deleted successfully.');
    }
}
PHP;

    $content = str_replace('__VAR__', $var, $content);

    file_put_contents("app/Http/Controllers/Api/V1/$controller.php", $content);
}
