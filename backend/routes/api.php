<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\OrderController;
use Illuminate\Support\Facades\Route;

// Публичный API витрины
Route::get('settings', [ContentController::class, 'settings']);
Route::get('home', [CatalogController::class, 'home']);
Route::get('categories', [CatalogController::class, 'categories']);
Route::get('brands', [CatalogController::class, 'brands']);
Route::get('products', [CatalogController::class, 'products']);
Route::get('products/{slug}', [CatalogController::class, 'product']);
Route::get('articles', [ContentController::class, 'articles']);
Route::get('articles/{slug}', [ContentController::class, 'article'])->name('articles.show');
Route::get('pages/{slug}', [ContentController::class, 'page']);
Route::get('delivery-options', [ContentController::class, 'deliveryOptions']);
Route::middleware('throttle:10,1')->group(function () {
    Route::post('orders', [OrderController::class, 'store']);
    Route::post('subscribe', [ContentController::class, 'subscribe']);
});

// API админки
Route::prefix('admin')->name('admin.')->group(function () {
    Route::post('login', [Admin\AuthController::class, 'login'])->middleware('throttle:5,1')->name('login');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [Admin\AuthController::class, 'me'])->name('me');
        Route::post('logout', [Admin\AuthController::class, 'logout'])->name('logout');
        Route::put('password', [Admin\AuthController::class, 'password'])->name('password');
        Route::get('dashboard', Admin\DashboardController::class)->name('dashboard');
        Route::get('meta', Admin\MetaController::class)->name('meta');
        Route::post('upload', Admin\UploadController::class)->name('upload');
        Route::get('settings', [Admin\SettingController::class, 'show'])->name('settings.show');
        Route::put('settings', [Admin\SettingController::class, 'update'])->name('settings.update');

        Route::apiResource('categories', Admin\CategoryController::class);
        Route::apiResource('brands', Admin\BrandController::class);
        Route::apiResource('products', Admin\ProductController::class);
        Route::apiResource('reviews', Admin\ReviewController::class);
        Route::apiResource('articles', Admin\ArticleController::class);
        Route::apiResource('pages', Admin\PageController::class);
        Route::apiResource('delivery-options', Admin\DeliveryOptionController::class);
        Route::apiResource('orders', Admin\OrderController::class)->except('store');
        Route::get('subscribers/export', [Admin\SubscriberController::class, 'export'])->name('subscribers.export');
        Route::apiResource('subscribers', Admin\SubscriberController::class)->only(['index', 'destroy']);
    });
});
