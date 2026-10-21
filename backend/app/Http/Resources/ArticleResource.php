<?php

namespace App\Http\Resources;

use App\Support\Frontend;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Article */
class ArticleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'tag' => $this->tag,
            'cover' => Frontend::storageUrl($this->cover),
            'excerpt' => $this->excerpt,
            'body' => $this->when($request->routeIs('articles.show', 'admin.*'), $this->body),
            'published_at' => $this->published_at?->toIso8601String(),
            'category' => $this->category ? new CategoryResource($this->category) : null,
            'seo_title' => $this->seo_title,
            'seo_description' => $this->seo_description,
        ];
    }
}
