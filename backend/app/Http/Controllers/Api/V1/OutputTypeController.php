<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\OutputType;
use App\Http\Requests\StoreOutputTypeRequest;
use App\Http\Requests\UpdateOutputTypeRequest;
use App\Http\Resources\MasterDataResource;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Gate;

class OutputTypeController extends Controller
{
    use ApiResponse;

    public function index()
    {
        Gate::authorize('viewAny', OutputType::class);
        $items = OutputType::all();
        return $this->successResponse(MasterDataResource::collection($items), 'OutputType retrieved successfully.');
    }

    public function store(StoreOutputTypeRequest $request)
    {
        Gate::authorize('create', OutputType::class);
        $item = OutputType::create($request->validated());
        return $this->successResponse(new MasterDataResource($item), 'OutputType created successfully.', 201);
    }

    public function show(OutputType $outputType)
    {
        Gate::authorize('view', $outputType);
        return $this->successResponse(new MasterDataResource($outputType), 'OutputType retrieved successfully.');
    }

    public function update(UpdateOutputTypeRequest $request, OutputType $outputType)
    {
        Gate::authorize('update', $outputType);
        $outputType->update($request->validated());
        return $this->successResponse(new MasterDataResource($outputType), 'OutputType updated successfully.');
    }

    public function destroy(OutputType $outputType)
    {
        Gate::authorize('delete', $outputType);
        $outputType->delete();
        return $this->successResponse(null, 'OutputType deleted successfully.');
    }
}