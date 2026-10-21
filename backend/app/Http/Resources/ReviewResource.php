<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Review */
class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'city' => $this->city,
            'rating' => $this->rating,
            'text' => $this->text,
            'product' => $this->product ? ['slug' => $this->product->slug, 'name' => $this->product->name] : null,
        ];
    }
}
