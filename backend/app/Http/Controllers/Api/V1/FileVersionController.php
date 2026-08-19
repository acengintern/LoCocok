<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\FileVersionApprovalStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFileVersionRequest;
use App\Http\Resources\FileVersionResource;
use App\Models\File;
use App\Models\FileVersion;
use App\Models\Project;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class FileVersionController extends Controller
{
    use ApiResponse;

    public function index(Project $project, File $file)
    {
        $this->authorize('view', $file);

        if ($file->project_id !== $project->id) {
            return $this->errorResponse('File does not belong to this project', null, 404);
        }

        $versions = $file->versions()->with('uploadedBy')->orderBy('version_number', 'desc')->get();

        return $this->successResponse(FileVersionResource::collection($versions), 'File versions retrieved successfully');
    }

    public function store(StoreFileVersionRequest $request, Project $project, File $file)
    {
        $this->authorize('update', $file);

        if ($file->project_id !== $project->id) {
            return $this->errorResponse('File does not belong to this project', null, 404);
        }

        $uploadedFile = $request->file('file');
        $path = $uploadedFile->store("projects/{$project->id}/files");

        $version = DB::transaction(function () use ($request, $file, $path) {
            $maxVersion = $file->versions()->max('version_number') ?? 0;

            $version = $file->versions()->create([
                'version_number' => $maxVersion + 1,
                'path' => $path,
                'uploaded_by' => auth()->id(),
                'approval_status' => FileVersionApprovalStatus::PENDING,
                'notes' => $request->notes,
            ]);

            $file->update([
                'current_version_id' => $version->id,
                'path' => $path,
            ]);

            return $version;
        });

        $version->load('uploadedBy');

        return $this->successResponse(new FileVersionResource($version), 'File version uploaded successfully', 201);
    }

    public function download(Project $project, File $file, FileVersion $version)
    {
        $this->authorize('download', $file);

        if ($file->project_id !== $project->id || $version->file_id !== $file->id) {
            return $this->errorResponse('Invalid resource relationship', null, 404);
        }

        if (!Storage::exists($version->path)) {
            return $this->errorResponse('File not found in storage', null, 404);
        }

        return Storage::download($version->path, $file->name);
    }
}
