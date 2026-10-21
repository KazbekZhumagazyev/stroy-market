<?php

namespace App\Models;

use App\Models\Concerns\HasSlug;
use App\Models\Concerns\RevalidatesFrontend;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug', 'logo', 'sort', 'is_active'])]
class Brand extends Model
{
    use HasSlug, RevalidatesFrontend;

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'sort' => 'integer'];
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function scopeActive(Builder $q): Builder
    {
        return $q->where('is_active', true)->orderBy('sort')->orderBy('name');
    }
}
