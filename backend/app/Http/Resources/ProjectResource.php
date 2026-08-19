<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_code' => $this->project_code,
            'client_id' => $this->client_id,
            'name' => $this->name,
            'project_type_id' => $this->project_type_id,
            'ae_id' => $this->ae_id,
            'sms_id' => $this->sms_id,
            'cd_id' => $this->cd_id,
            'priority' => $this->priority,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'actual_end_date' => $this->actual_end_date?->toDateString(),
            'status' => $this->status,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,

            // Relationships
            'client' => $this->whenLoaded('client'),
            'projectType' => $this->whenLoaded('projectType'),
            'ae' => $this->whenLoaded('ae'),
            'sms' => $this->whenLoaded('sms'),
            'cd' => $this->whenLoaded('creativeDirector'),
            'outputs' => $this->whenLoaded('outputs'),
            'tasks' => $this->whenLoaded('tasks'),
            'financialSummary' => $this->whenLoaded('financial'),
        ];
    }
}
