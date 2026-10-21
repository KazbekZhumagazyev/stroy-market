<?php

namespace App\Models;

use App\Models\Concerns\RevalidatesFrontend;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['title', 'note', 'price', 'free_from', 'requires_address', 'sort', 'is_active'])]
class DeliveryOption extends Model
{
    use RevalidatesFrontend;

    protected function casts(): array
    {
        return ['price' => 'integer', 'free_from' => 'integer', 'requires_address' => 'boolean', 'is_active' => 'boolean'];
    }

    public function scopeActive(Builder $q): Builder
    {
        return $q->where('is_active', true)->orderBy('sort')->orderBy('id');
    }

    /** Цена с учётом бесплатной доставки от суммы. */
    public function priceFor(int $total): int
    {
        return $this->free_from && $total >= $this->free_from ? 0 : $this->price;
    }
}
