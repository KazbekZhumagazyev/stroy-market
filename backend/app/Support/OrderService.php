<?php

namespace App\Support;

use App\Models\DeliveryOption;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/** Создание заказа: цены и скидки всегда пересчитываются на сервере. */
class OrderService
{
    public function create(array $data): Order
    {
        $qty = collect($data['items'])->mapWithKeys(fn ($i) => [(int) $i['id'] => (int) $i['qty']]);
        $products = Product::active()->whereIn('id', $qty->keys())->with('bundle:id')->get()->keyBy('id');

        if ($products->count() !== $qty->count()) {
            throw ValidationException::withMessages(['items' => 'Некоторые товары больше не продаются. Обновите корзину.']);
        }

        $delivery = DeliveryOption::active()->findOrFail($data['delivery_option_id']);
        if ($delivery->requires_address && blank($data['address'] ?? null)) {
            throw ValidationException::withMessages(['address' => 'Укажите адрес доставки.']);
        }

        $subtotal = 0;
        $discount = 0;
        $items = [];
        foreach ($qty as $id => $q) {
            $p = $products[$id];
            $subtotal += $p->price * $q;
            $discount += $p->old_price > $p->price ? ($p->old_price - $p->price) * $q : 0;
            $items[] = [
                'product_id' => $p->id, 'name' => $p->name, 'sku' => $p->sku, 'unit' => $p->unit,
                'price' => $p->price, 'old_price' => $p->old_price, 'qty' => $q, 'total' => $p->price * $q,
            ];
        }

        $bundleDiscount = $this->bundleDiscount($data['bundles'] ?? [], $products, $qty->all());
        $goods = $subtotal - $bundleDiscount;
        $deliveryPrice = $delivery->priceFor($goods);

        return DB::transaction(function () use ($data, $delivery, $deliveryPrice, $subtotal, $discount, $bundleDiscount, $goods, $items) {
            $order = Order::create([
                'number' => 'tmp-'.uniqid(),
                'customer_name' => $data['name'],
                'phone' => $data['phone'],
                'email' => $data['email'] ?? null,
                'address' => $delivery->requires_address ? $data['address'] : null,
                'comment' => $data['comment'] ?? null,
                'delivery_option_id' => $delivery->id,
                'delivery_title' => $delivery->title,
                'delivery_price' => $deliveryPrice,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'bundle_discount' => $bundleDiscount,
                'total' => $goods + $deliveryPrice,
            ]);
            $order->update(['number' => (string) (100000 + $order->id)]);
            $order->items()->createMany($items);
            foreach ($items as $item) {
                Product::whereKey($item['product_id'])->increment('sold', $item['qty']);
            }

            return $order->load('items');
        });
    }

    /**
     * Скидка «Купите вместе»: комплект = [основной товар, ...сопутствующие из его bundle].
     * Действует, пока все товары комплекта есть в заказе; каждая единица участвует в одном комплекте.
     */
    private function bundleDiscount(array $bundles, $products, array $left): int
    {
        $percent = (float) SiteSettings::get('cart.bundle_discount_percent', 0) / 100;
        $sum = 0;
        foreach ($bundles as $ids) {
            $ids = array_values(array_unique(array_map('intval', (array) $ids)));
            if (count($ids) < 2 || ! isset($products[$ids[0]])) {
                continue;
            }
            $allowed = $products[$ids[0]]->bundle->pluck('id')->all();
            $valid = collect(array_slice($ids, 1))->every(fn ($id) => in_array($id, $allowed));
            if (! $valid || collect($ids)->contains(fn ($id) => ($left[$id] ?? 0) < 1)) {
                continue;
            }
            foreach ($ids as $id) {
                $left[$id]--;
                $sum += $products[$id]->price * $percent;
            }
        }

        return (int) round($sum);
    }
}
