<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Page */
class PageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'title' => $this->title,
            'lead' => $this->lead,
            'sections' => array_values($this->sections ?? []),
            'seo_title' => $this->seo_title,
            'seo_description' => $this->seo_description,
        ];
    }
}
