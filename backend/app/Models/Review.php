<?php

namespace App\Models;

use App\Models\Concerns\RevalidatesFrontend;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['product_id', 'name', 'city', 'rating', 'text', 'is_published', 'sort'])]
class Review extends Model
{
    use RevalidatesFrontend;

    protected function casts(): array
    {
        return ['is_published' => 'boolean', 'rating' => 'integer'];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function scopePublished(Builder $q): Builder
    {
        return $q->where('is_published', true)->orderBy('sort')->latest();
    }
}
