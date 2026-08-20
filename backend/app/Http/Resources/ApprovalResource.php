<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApprovalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'approvable_type' => $this->approvable_type,
            'approvable_id' => $this->approvable_id,
            'status' => $this->status,
            'notes' => $this->comments,
            'user' => [
                'id' => $this->user_id,
                'name' => $this->user?->name,
            ],
            'client_name' => $this->client_name,
            'reviewed_at' => $this->reviewed_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
