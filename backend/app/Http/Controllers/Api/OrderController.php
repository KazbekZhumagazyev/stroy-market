<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\OrderNotifier;
use App\Support\OrderService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function store(Request $request, OrderService $service)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'min:10', 'max:32'],
            'email' => ['nullable', 'email', 'max:190'],
            'address' => ['nullable', 'string', 'max:255'],
            'comment' => ['nullable', 'string', 'max:1000'],
            'delivery_option_id' => ['required', 'integer'],
            'items' => ['required', 'array', 'min:1', 'max:100'],
            'items.*.id' => ['required', 'integer', 'distinct'],
            'items.*.qty' => ['required', 'integer', 'min:1', 'max:100000'],
            'bundles' => ['nullable', 'array', 'max:50'],
            'bundles.*' => ['array', 'max:10'],
        ], [], [
            'name' => 'имя', 'phone' => 'телефон', 'email' => 'e-mail', 'address' => 'адрес', 'items' => 'товары',
        ]);

        $order = $service->create($data);
        dispatch(fn () => OrderNotifier::send($order))->afterResponse();

        return response()->json(['number' => $order->number, 'total' => $order->total], 201);
    }
}
