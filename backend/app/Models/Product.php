<?php

namespace App\Models;

use App\Models\Concerns\HasSlug;
use App\Models\Concerns\RevalidatesFrontend;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'category_id', 'brand_id', 'name', 'slug', 'sku', 'price', 'old_price', 'unit', 'rating', 'sold', 'stock', 'badge',
    'images', 'short_description', 'description', 'specs', 'calc', 'is_active', 'is_featured', 'sort', 'seo_title', 'seo_description',
])]
class Product extends Model
{
    use HasSlug, RevalidatesFrontend;

    public const BADGES = ['hot' => 'Хит', 'new' => 'Новинка', 'sale' => 'Акция'];

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'specs' => 'array',
            'calc' => 'array',
            'rating' => 'float',
            'price' => 'integer',
            'old_price' => 'integer',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::created(function (Product $p) {
            if (! $p->sku) {
                $p->updateQuietly(['sku' => 'YGM-'.str_pad((string) $p->id, 5, '0', STR_PAD_LEFT)]);
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    /** Товары для блока «Купите вместе». */
    public function bundle(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_bundle', 'product_id', 'related_id')->withPivot('sort')->orderByPivot('sort');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function scopeActive(Builder $q): Builder
    {
        return $q->where($q->qualifyColumn('is_active'), true)->whereHas('category', fn ($c) => $c->where('is_active', true));
    }

    public function discountPercent(): int
    {
        return $this->old_price && $this->old_price > $this->price ? (int) round((1 - $this->price / $this->old_price) * 100) : 0;
    }
}
