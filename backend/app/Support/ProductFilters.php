<?php

namespace App\Support;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

/** Фильтры каталога. Фасеты считаются без собственного фильтра (чтобы можно было выбрать несколько). */
class ProductFilters
{
    public const SORTS = [
        'default' => 'По умолчанию',
        'popular' => 'Популярные',
        'price-asc' => 'Сначала дешевле',
        'price-desc' => 'Сначала дороже',
        'rating' => 'По рейтингу',
        'discount' => 'По размеру скидки',
        'new' => 'Новинки',
        'name' => 'По названию',
    ];

    public array $categories;

    public array $brands;

    public array $ids;

    public function __construct(private Request $request)
    {
        $this->categories = self::list($request->input('category'));
        $this->brands = self::list($request->input('brands'));
        $this->ids = array_map('intval', self::list($request->input('ids')));
    }

    public function query(array $except = []): Builder
    {
        $r = $this->request;
        $q = Product::query()->active();

        if ($this->ids) {
            $q->whereIn('products.id', $this->ids);
        }
        if ($this->categories && ! in_array('category', $except)) {
            $q->whereHas('category', fn ($c) => $c->whereIn('slug', $this->categories));
        }
        if ($this->brands && ! in_array('brands', $except)) {
            $q->whereHas('brand', fn ($b) => $b->whereIn('slug', $this->brands));
        }
        if ($term = trim((string) $r->input('q'))) {
            $like = '%'.mb_strtolower($term).'%';
            $q->where(fn ($w) => $w->whereRaw('LOWER(products.name) LIKE ?', [$like])
                ->orWhereRaw('LOWER(products.sku) LIKE ?', [$like])
                ->orWhereHas('brand', fn ($b) => $b->whereRaw('LOWER(name) LIKE ?', [$like]))
                ->orWhereHas('category', fn ($c) => $c->whereRaw('LOWER(name) LIKE ?', [$like])));
        }
        if ($r->boolean('sale')) {
            $q->whereNotNull('old_price')->whereColumn('old_price', '>', 'price');
        }
        if ($r->boolean('stock')) {
            $q->where('stock', '>', (int) SiteSettings::get('cart.low_stock', 50));
        }
        if (! in_array('price', $except)) {
            if ($r->filled('min')) {
                $q->where('price', '>=', (int) $r->input('min'));
            }
            if ($r->filled('max')) {
                $q->where('price', '<=', (int) $r->input('max'));
            }
        }

        return $q;
    }

    public function sorted(Builder $q): Builder
    {
        return match ($this->request->input('sort')) {
            'popular' => $q->orderByDesc('sold'),
            'price-asc' => $q->orderBy('price'),
            'price-desc' => $q->orderByDesc('price'),
            'rating' => $q->orderByDesc('rating')->orderByDesc('sold'),
            'discount' => $q->orderByRaw('CASE WHEN old_price > price THEN (old_price - price)::float / old_price ELSE 0 END DESC'),
            'new' => $q->orderByDesc('created_at'),
            'name' => $q->orderBy('name'),
            default => $q->orderByDesc('is_featured')->orderBy('sort')->orderBy('id'),
        };
    }

    public function facets(): array
    {
        $byCategory = $this->query(['category'])->toBase()
            ->join('categories', 'categories.id', '=', 'products.category_id')
            ->selectRaw('categories.slug, categories.name, categories.sort, COUNT(*) AS count')
            ->groupBy('categories.slug', 'categories.name', 'categories.sort')->orderBy('categories.sort')->orderBy('categories.name')->get();

        $byBrand = $this->query(['brands'])->toBase()
            ->join('brands', 'brands.id', '=', 'products.brand_id')
            ->selectRaw('brands.slug, brands.name, COUNT(*) AS count')
            ->groupBy('brands.slug', 'brands.name')->orderByDesc('count')->orderBy('brands.name')->get();

        $price = Product::query()->active()->toBase()->selectRaw('MIN(price) AS min, MAX(price) AS max')->first();

        return [
            'categories' => $byCategory->map(fn ($c) => ['slug' => $c->slug, 'name' => $c->name, 'count' => (int) $c->count]),
            'brands' => $byBrand->map(fn ($b) => ['slug' => $b->slug, 'name' => $b->name, 'count' => (int) $b->count]),
            'price' => ['min' => (int) ($price->min ?? 0), 'max' => (int) ($price->max ?? 0)],
            'sorts' => collect(self::SORTS)->map(fn ($label, $value) => compact('value', 'label'))->values(),
        ];
    }

    private static function list(mixed $value): array
    {
        $items = is_array($value) ? $value : explode(',', (string) $value);

        return array_values(array_filter(array_map('trim', $items), fn ($v) => $v !== ''));
    }
}
