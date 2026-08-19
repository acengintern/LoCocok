<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FileType;
use App\Http\Requests\StoreFileTypeRequest;
use App\Http\Requests\UpdateFileTypeRequest;
use App\Http\Resources\MasterDataResource;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Gate;

class FileTypeController extends Controller
{
    use ApiResponse;

    public function index()
    {
        Gate::authorize('viewAny', FileType::class);
        $items = FileType::all();
        return $this->successResponse(MasterDataResource::collection($items), 'FileType retrieved successfully.');
    }

    public function store(StoreFileTypeRequest $request)
    {
        Gate::authorize('create', FileType::class);
        $item = FileType::create($request->validated());
        return $this->successResponse(new MasterDataResource($item), 'FileType created successfully.', 201);
    }

    public function show(FileType $fileType)
    {
        Gate::authorize('view', $fileType);
        return $this->successResponse(new MasterDataResource($fileType), 'FileType retrieved successfully.');
    }

    public function update(UpdateFileTypeRequest $request, FileType $fileType)
    {
        Gate::authorize('update', $fileType);
        $fileType->update($request->validated());
        return $this->successResponse(new MasterDataResource($fileType), 'FileType updated successfully.');
    }

    public function destroy(FileType $fileType)
    {
        Gate::authorize('delete', $fileType);
        $fileType->delete();
        return $this->successResponse(null, 'FileType deleted successfully.');
    }
}