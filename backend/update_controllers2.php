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
        'var' => 'project_type', // Changed to match route parameter! Wait, route parameter is usually snake_case or camelCase?
        'controller' => 'ProjectTypeController',
        'storeRequest' => 'StoreProjectTypeRequest',
        'updateRequest' => 'UpdateProjectTypeRequest'
    ],
    [
        'model' => 'OutputType',
        'var' => 'output_type',
        'controller' => 'OutputTypeController',
        'storeRequest' => 'StoreOutputTypeRequest',
        'updateRequest' => 'UpdateOutputTypeRequest'
    ],
    [
        'model' => 'TaskType',
        'var' => 'task_type',
        'controller' => 'TaskTypeController',
        'storeRequest' => 'StoreTaskTypeRequest',
        'updateRequest' => 'UpdateTaskTypeRequest'
    ],
    [
        'model' => 'FileType',
        'var' => 'file_type',
        'controller' => 'FileTypeController',
        'storeRequest' => 'StoreFileTypeRequest',
        'updateRequest' => 'UpdateFileTypeRequest'
    ],
];

foreach ($entities as $e) {
    $model = $e['model'];
    $var = $e['var']; // The variable name e.g. project_type
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
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class $controller extends Controller
{
    use ApiResponse, AuthorizesRequests;

    public function __construct()
    {
        \$this->authorizeResource($model::class, '$var');
    }

    public function index()
    {
        \$items = $model::all();
        return \$this->successResponse(MasterDataResource::collection(\$items), '$model retrieved successfully.');
    }

    public function store($storeReq \$request)
    {
        \$item = $model::create(\$request->validated());
        return \$this->successResponse(new MasterDataResource(\$item), '$model created successfully.', 201);
    }

    public function show($model \$$var)
    {
        return \$this->successResponse(new MasterDataResource(\$$var), '$model retrieved successfully.');
    }

    public function update($updateReq \$request, $model \$$var)
    {
        \${$var}->update(\$request->validated());
        return \$this->successResponse(new MasterDataResource(\$$var), '$model updated successfully.');
    }

    public function destroy($model \$$var)
    {
        \${$var}->delete();
        return \$this->successResponse(null, '$model deleted successfully.');
    }
}
PHP;

    file_put_contents("app/Http/Controllers/Api/V1/$controller.php", $content);
}
