<?php

namespace App\Models;

use App\Models\Concerns\HasSlug;
use App\Models\Concerns\RevalidatesFrontend;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug', 'icon', 'color', 'bg', 'image', 'description', 'sort', 'is_active', 'show_in_menu', 'seo_title', 'seo_description'])]
class Category extends Model
{
    use HasSlug, RevalidatesFrontend;

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'show_in_menu' => 'boolean', 'sort' => 'integer'];
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
