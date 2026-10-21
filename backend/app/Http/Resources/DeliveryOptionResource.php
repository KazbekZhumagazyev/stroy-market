<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\DeliveryOption */
class DeliveryOptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'note' => $this->note,
            'price' => $this->price,
            'free_from' => $this->free_from,
            'requires_address' => $this->requires_address,
        ];
    }
}
