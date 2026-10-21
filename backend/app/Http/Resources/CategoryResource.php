<?php

namespace App\Http\Resources;

use App\Support\Frontend;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Category */
class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'icon' => $this->icon,
            'color' => $this->color,
            'bg' => $this->bg,
            'image' => Frontend::storageUrl($this->image),
            'description' => $this->description,
            'show_in_menu' => $this->show_in_menu,
            'products_count' => $this->whenCounted('products'),
            'seo_title' => $this->seo_title,
            'seo_description' => $this->seo_description,
        ];
    }
}
