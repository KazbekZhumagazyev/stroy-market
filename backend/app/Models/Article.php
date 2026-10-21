<?php

namespace App\Models;

use App\Models\Concerns\HasSlug;
use App\Models\Concerns\RevalidatesFrontend;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['category_id', 'title', 'slug', 'tag', 'cover', 'excerpt', 'body', 'is_published', 'published_at', 'seo_title', 'seo_description'])]
class Article extends Model
{
    use HasSlug, RevalidatesFrontend;

    protected string $slugSource = 'title';

    protected function casts(): array
    {
        return ['is_published' => 'boolean', 'published_at' => 'datetime'];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function scopePublished(Builder $q): Builder
    {
        return $q->where('is_published', true)->where(fn ($w) => $w->whereNull('published_at')->orWhere('published_at', '<=', now()))
            ->orderByDesc('published_at')->orderByDesc('id');
    }
}
