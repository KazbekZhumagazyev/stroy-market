<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'number', 'status', 'customer_name', 'phone', 'email', 'address', 'comment', 'delivery_option_id', 'delivery_title',
    'delivery_price', 'subtotal', 'discount', 'bundle_discount', 'total', 'manager_note',
])]
class Order extends Model
{
    public const STATUSES = [
        'new' => 'Новый',
        'confirmed' => 'Подтверждён',
        'delivering' => 'В доставке',
        'completed' => 'Выполнен',
        'cancelled' => 'Отменён',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function deliveryOption(): BelongsTo
    {
        return $this->belongsTo(DeliveryOption::class);
    }
}
