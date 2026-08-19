<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProjectOutputResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'output_type_id' => $this->output_type_id,
            'name' => $this->period,
            'target_quantity' => $this->target_qty,
            'actual_quantity' => $this->actual_qty,
            'output_type' => new MasterDataResource($this->whenLoaded('outputType')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
