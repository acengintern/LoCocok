<?php

namespace App\Traits;

use App\Models\File;
use App\Models\FileVersion;
use App\Models\ContentPlan;
use App\Models\Script;
use App\Models\Task;
use Illuminate\Database\Eloquent\Model;

trait ResolvesPolymorphicModel
{
    protected array $morphWhitelist = [
        'files' => File::class,
        'file_versions' => FileVersion::class,
        'content_plans' => ContentPlan::class,
        'scripts' => Script::class,
        'tasks' => Task::class,
    ];

    /**
     * Resolve the target polymorphic model.
     *
     * @param string $targetType
     * @param int|string $id
     * @return Model
     */
    protected function resolveTargetModel(string $targetType, $id): Model
    {
        if (!array_key_exists($targetType, $this->morphWhitelist)) {
            abort(400, "Invalid target type: {$targetType}");
        }

        $modelClass = $this->morphWhitelist[$targetType];
        
        $model = $modelClass::find($id);

        if (!$model) {
            abort(404, "Target model not found.");
        }

        return $model;
    }
}
