<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $q = Order::query()->withCount('items')->latest('id');
        if ($status = $request->input('status')) {
            $q->where('status', $status);
        }
        if ($term = trim((string) $request->input('q'))) {
            $like = '%'.mb_strtolower($term).'%';
            $q->where(fn ($w) => $w->where('number', 'like', $like)->orWhereRaw('LOWER(customer_name) LIKE ?', [$like])->orWhere('phone', 'like', $like));
        }
        $page = $q->paginate(20);

        return [
            'data' => $page->items(),
            'meta' => ['total' => $page->total(), 'page' => $page->currentPage(), 'last_page' => $page->lastPage()],
            'counts' => Order::selectRaw('status, COUNT(*) AS c')->groupBy('status')->pluck('c', 'status'),
        ];
    }

    public function show(int $id)
    {
        return ['data' => Order::with('items.product:id,slug')->findOrFail($id)];
    }

    public function update(Request $request, int $id)
    {
        $order = Order::findOrFail($id);
        $order->update($request->validate([
            'status' => ['sometimes', Rule::in(array_keys(Order::STATUSES))],
            'manager_note' => ['nullable', 'string', 'max:5000'],
        ]));

        return ['data' => $order->load('items.product:id,slug')];
    }

    public function destroy(int $id)
    {
        Order::findOrFail($id)->delete();

        return ['ok' => true];
    }
}
