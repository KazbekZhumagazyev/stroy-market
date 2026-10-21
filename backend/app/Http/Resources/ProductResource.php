<?php

namespace App\Http\Resources;

use App\Support\Frontend;
use Illuminate\Http\Request;

/** Полная карточка товара. @mixin \App\Models\Product */
class ProductResource extends ProductCardResource
{
    public function toArray(Request $request): array
    {
        return parent::toArray($request) + [
            'images' => array_map([Frontend::class, 'storageUrl'], $this->images ?? []),
            'short_description' => $this->short_description,
            'description' => $this->description,
            'specs' => array_values($this->specs ?? []),
            'calc' => $this->calc && ($this->calc['per_unit'] ?? 0) > 0 ? $this->calc : null,
            'seo_title' => $this->seo_title,
            'seo_description' => $this->seo_description,
        ];
    }
}
