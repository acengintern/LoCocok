<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'task_id' => $this->task_id,
            'name' => $this->name,
            'file_type_id' => $this->file_type_id,
            'path' => $this->path,
            'uploaded_by' => $this->uploaded_by,
            'current_version_id' => $this->current_version_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'versions' => FileVersionResource::collection($this->whenLoaded('versions')),
            'current_version' => new FileVersionResource($this->whenLoaded('currentVersion')),
            'uploaded_by_user' => $this->whenLoaded('uploadedBy'),
            'file_type' => $this->whenLoaded('fileType'),
        ];
    }
}
