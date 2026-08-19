<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'contact' => $this->contact,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'pic_ae_id' => $this->pic_ae_id,
            'pic_sms_id' => $this->pic_sms_id,
            'status' => $this->status,
            'notes' => $this->notes,
            'pic_ae' => new UserResource($this->whenLoaded('picAe')),
            'pic_sms' => new UserResource($this->whenLoaded('picSms')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
