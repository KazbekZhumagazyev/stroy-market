<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;

/** Справочники для выпадающих списков в формах админки. */
class MetaController extends Controller
{
    public function __invoke()
    {
        return [
            'categories' => Category::orderBy('sort')->orderBy('name')->get(['id', 'name']),
            'brands' => Brand::orderBy('name')->get(['id', 'name']),
            'products' => Product::orderBy('name')->get(['id', 'name', 'price']),
            'order_statuses' => Order::STATUSES,
            'badges' => Product::BADGES,
            'new_orders' => Order::where('status', 'new')->count(),
        ];
    }
}
