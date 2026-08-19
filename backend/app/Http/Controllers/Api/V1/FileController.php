<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\FileVersionApprovalStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFileRequest;
use App\Http\Resources\FileResource;
use App\Models\File;
use App\Models\Project;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\DB;

class FileController extends Controller
{
    use ApiResponse;

    public function index(Project $project)
    {
        $this->authorize('viewAny', [File::class, $project]);

        $files = $project->files()->with(['currentVersion', 'fileType', 'uploadedBy'])->get();

        return $this->successResponse(FileResource::collection($files), 'Files retrieved successfully');
    }

    public function store(StoreFileRequest $request, Project $project)
    {
        $this->authorize('create', [File::class, $project]);

        $uploadedFile = $request->file('file');
        $path = $uploadedFile->store("projects/{$project->id}/files");

        $file = DB::transaction(function () use ($request, $project, $path) {
            $file = $project->files()->create([
                'name' => $request->name,
                'task_id' => $request->task_id,
                'file_type_id' => $request->file_type_id,
                'path' => $path,
                'uploaded_by' => auth()->id(),
            ]);

            $version = $file->versions()->create([
                'version_number' => 1,
                'path' => $path,
                'uploaded_by' => auth()->id(),
                'approval_status' => FileVersionApprovalStatus::PENDING,
            ]);

            $file->update(['current_version_id' => $version->id]);

            return $file;
        });

        $file->load(['currentVersion', 'fileType', 'uploadedBy']);

        return $this->successResponse(new FileResource($file), 'File uploaded successfully', 201);
    }

    public function show(Project $project, File $file)
    {
        $this->authorize('view', $file);

        if ($file->project_id !== $project->id) {
            return $this->errorResponse('File does not belong to this project', null, 404);
        }

        $file->load(['versions', 'currentVersion', 'fileType', 'uploadedBy']);

        return $this->successResponse(new FileResource($file), 'File retrieved successfully');
    }

    public function destroy(Project $project, File $file)
    {
        $this->authorize('delete', $file);

        if ($file->project_id !== $project->id) {
            return $this->errorResponse('File does not belong to this project', null, 404);
        }

        $file->delete();

        return $this->successResponse(null, 'File deleted successfully');
    }
}
