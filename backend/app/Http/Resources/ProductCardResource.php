<?php

namespace App\Http\Resources;

use App\Support\Frontend;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Короткая карточка товара: каталог, подборки, корзина. @mixin \App\Models\Product */
class ProductCardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'name' => $this->name,
            'brand' => $this->brand?->name,
            'category' => [
                'slug' => $this->category->slug,
                'name' => $this->category->name,
                'icon' => $this->category->icon,
                'color' => $this->category->color,
                'bg' => $this->category->bg,
            ],
            'price' => $this->price,
            'old_price' => $this->old_price,
            'discount' => $this->discountPercent(),
            'unit' => $this->unit,
            'rating' => $this->rating,
            'sold' => $this->sold,
            'stock' => $this->stock,
            'badge' => $this->badge,
            'image' => Frontend::storageUrl($this->images[0] ?? null),
        ];
    }
}
