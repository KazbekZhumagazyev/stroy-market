<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Subscriber;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $active = fn () => Order::where('status', '!=', 'cancelled');
        $from = now()->subDays(29)->startOfDay();

        $daily = $active()->where('created_at', '>=', $from)
            ->selectRaw("DATE(created_at) AS day, COUNT(*) AS orders, SUM(total) AS revenue")
            ->groupBy('day')->get()->keyBy(fn ($r) => Carbon::parse($r->day)->toDateString());

        $chart = collect(range(29, 0))->map(function ($i) use ($daily) {
            $day = now()->subDays($i)->toDateString();

            return ['date' => $day, 'orders' => (int) ($daily[$day]->orders ?? 0), 'revenue' => (int) ($daily[$day]->revenue ?? 0)];
        });

        return [
            'stats' => [
                'orders_today' => $active()->whereDate('created_at', today())->count(),
                'revenue_today' => (int) $active()->whereDate('created_at', today())->sum('total'),
                'revenue_month' => (int) $active()->where('created_at', '>=', now()->startOfMonth())->sum('total'),
                'new_orders' => Order::where('status', 'new')->count(),
                'products' => Product::count(),
                'low_stock' => Product::where('is_active', true)->where('stock', '<=', 50)->count(),
                'subscribers' => Subscriber::count(),
                'average_check' => (int) $active()->where('created_at', '>=', $from)->avg('total'),
            ],
            'chart' => $chart,
            'latest_orders' => Order::latest()->limit(8)->get(['id', 'number', 'status', 'customer_name', 'phone', 'total', 'created_at']),
            'top_products' => Product::orderByDesc('sold')->limit(5)->get(['id', 'name', 'sold', 'price', 'stock']),
        ];
    }
}
