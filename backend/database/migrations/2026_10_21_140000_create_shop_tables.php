<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('value')->nullable();
            $table->timestamps();
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon')->default('package');
            $table->string('color', 9)->default('#455a64');
            $table->string('bg', 9)->default('#eceff1');
            $table->string('image')->nullable();
            $table->text('description')->nullable();
            $table->unsignedInteger('sort')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('show_in_menu')->default(true);
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->timestamps();
        });

        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('logo')->nullable();
            $table->unsignedInteger('sort')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->foreignId('brand_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sku')->nullable()->unique();
            $table->unsignedInteger('price');
            $table->unsignedInteger('old_price')->nullable();
            $table->string('unit', 32)->default('шт');
            $table->decimal('rating', 2, 1)->default(5);
            $table->unsignedInteger('sold')->default(0);
            $table->unsignedInteger('stock')->default(0);
            $table->string('badge', 16)->nullable();
            $table->json('images')->nullable();
            $table->text('short_description')->nullable();
            $table->longText('description')->nullable();
            $table->json('specs')->nullable();
            $table->json('calc')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('sort')->default(0);
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->timestamps();
            $table->index(['is_active', 'category_id']);
            $table->index('price');
        });

        Schema::create('product_bundle', function (Blueprint $table) {
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('related_id')->constrained('products')->cascadeOnDelete();
            $table->unsignedInteger('sort')->default(0);
            $table->primary(['product_id', 'related_id']);
        });

        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('city')->nullable();
            $table->unsignedTinyInteger('rating')->default(5);
            $table->text('text');
            $table->boolean('is_published')->default(true);
            $table->unsignedInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('tag')->nullable();
            $table->string('cover')->nullable();
            $table->text('excerpt')->nullable();
            $table->longText('body')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->timestamps();
        });

        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('lead')->nullable();
            $table->json('sections')->nullable();
            $table->boolean('is_published')->default(true);
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->timestamps();
        });

        Schema::create('delivery_options', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('note')->nullable();
            $table->unsignedInteger('price')->default(0);
            $table->unsignedInteger('free_from')->nullable();
            $table->boolean('requires_address')->default(true);
            $table->unsignedInteger('sort')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->string('status', 20)->default('new')->index();
            $table->string('customer_name');
            $table->string('phone', 32);
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->text('comment')->nullable();
            $table->foreignId('delivery_option_id')->nullable()->constrained()->nullOnDelete();
            $table->string('delivery_title')->nullable();
            $table->unsignedInteger('delivery_price')->default(0);
            $table->unsignedInteger('subtotal');
            $table->unsignedInteger('discount')->default(0);
            $table->unsignedInteger('bundle_discount')->default(0);
            $table->unsignedInteger('total');
            $table->text('manager_note')->nullable();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('sku')->nullable();
            $table->string('unit', 32);
            $table->unsignedInteger('price');
            $table->unsignedInteger('old_price')->nullable();
            $table->unsignedInteger('qty');
            $table->unsignedInteger('total');
        });

        Schema::create('subscribers', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['subscribers', 'order_items', 'orders', 'delivery_options', 'pages', 'articles', 'reviews', 'product_bundle', 'products', 'brands', 'categories', 'settings'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
