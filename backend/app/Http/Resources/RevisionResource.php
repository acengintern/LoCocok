<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RevisionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'revisionable_type' => $this->revisionable_type,
            'revisionable_id' => $this->revisionable_id,
            'status' => $this->status,
            'revision_notes' => $this->description,
            'requested_by' => [
                'id' => $this->requested_by,
                'name' => $this->requestedBy?->name,
            ],
            'resolved_at' => $this->resolved_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
