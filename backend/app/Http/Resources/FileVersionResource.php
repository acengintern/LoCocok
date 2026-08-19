<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FileVersionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'file_id' => $this->file_id,
            'version_number' => $this->version_number,
            'path' => $this->path,
            'uploaded_by' => $this->uploaded_by,
            'approval_status' => $this->approval_status,
            'revision_reason' => $this->revision_reason,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'uploaded_by_user' => $this->whenLoaded('uploadedBy'),
        ];
    }
}
