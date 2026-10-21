<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleResource;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductCardResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ReviewResource;
use App\Models\Article;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Review;
use App\Support\ProductFilters;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    private const CARD_WITH = ['category', 'brand'];

    public function categories()
    {
        return CategoryResource::collection($this->categoriesWithCounts());
    }

    public function brands()
    {
        $brands = Brand::active()->whereHas('products', fn ($p) => $p->active())->get();

        return $brands->map(fn (Brand $b) => ['slug' => $b->slug, 'name' => $b->name]);
    }

    public function products(Request $request)
    {
        $filters = new ProductFilters($request);
        $query = $filters->sorted($filters->query())->with(self::CARD_WITH);

        if ($filters->ids) {
            return ProductCardResource::collection($query->get());
        }

        $perPage = min(60, max(1, (int) $request->input('per_page', 12)));

        return ProductCardResource::collection($query->paginate($perPage)->withQueryString())
            ->additional(['facets' => $filters->facets()]);
    }

    public function product(string $slug)
    {
        $product = Product::active()->with([...self::CARD_WITH, 'bundle' => fn ($q) => $q->active()->with(self::CARD_WITH)])
            ->where('slug', $slug)->firstOrFail();

        $related = Product::active()->with(self::CARD_WITH)->whereKeyNot($product->id)
            ->orderByRaw('CASE WHEN category_id = ? THEN 0 ELSE 1 END', [$product->category_id])
            ->orderByDesc('sold')->limit(5)->get();

        $reviews = Review::published()->with('product')
            ->orderByRaw('CASE WHEN product_id = ? THEN 0 ELSE 1 END', [$product->id])->limit(3)->get();

        return [
            'data' => new ProductResource($product),
            'bundle' => ProductCardResource::collection($product->bundle),
            'related' => ProductCardResource::collection($related),
            'reviews' => ReviewResource::collection($reviews),
            'reviews_count' => $product->reviews()->where('is_published', true)->count(),
        ];
    }

    public function home()
    {
        $cards = fn ($q) => ProductCardResource::collection($q->with(self::CARD_WITH)->get());
        $categories = $this->categoriesWithCounts();

        $tabs = $categories->where('products_count', '>', 0)->sortByDesc('products_count')->take(6)->values()
            ->map(fn (Category $c) => [
                'category' => new CategoryResource($c),
                'products' => $cards(Product::active()->where('category_id', $c->id)->orderByDesc('sold')->limit(5)),
            ]);

        return [
            'categories' => CategoryResource::collection($categories),
            'deals' => $cards(Product::active()->whereColumn('old_price', '>', 'price')
                ->orderByRaw('(old_price - price)::float / old_price DESC')->limit(5)),
            'hits' => $cards(Product::active()->orderByDesc('sold')->limit(10)),
            'fresh' => $cards(Product::active()->where(fn ($w) => $w->where('badge', 'new')->orWhere('is_featured', true))->latest()->limit(5)),
            'tabs' => $tabs,
            'reviews' => ReviewResource::collection(Review::published()->with('product')->limit(6)->get()),
            'articles' => ArticleResource::collection(Article::published()->with('category')->limit(4)->get()),
            'brands' => $this->brands(),
        ];
    }

    private function categoriesWithCounts()
    {
        return Category::active()->withCount(['products' => fn ($p) => $p->where('is_active', true)])->get();
    }
}
