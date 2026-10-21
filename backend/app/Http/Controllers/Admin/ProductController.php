<?php

namespace App\Http\Controllers\Admin;

use App\Models\Product;
use App\Support\Frontend;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;

class ProductController extends CrudController
{
    protected string $model = Product::class;

    protected array $search = ['products.name', 'products.sku'];

    protected array $with = ['category:id,name,icon,color,bg', 'brand:id,name', 'bundle:id,name'];

    protected function query(Request $request): Builder
    {
        $q = Product::query()->with($this->with);
        if ($request->filled('category_id')) {
            $q->where('category_id', $request->integer('category_id'));
        }
        if ($request->filled('status')) {
            $q->where('is_active', $request->input('status') === 'active');
        }

        return match ($request->input('sort')) {
            'price' => $q->orderBy('price'),
            'stock' => $q->orderBy('stock'),
            'sold' => $q->orderByDesc('sold'),
            default => $q->latest('id'),
        };
    }

    protected function rules(Request $request, ?Model $item): array
    {
        return [
            'category_id' => ['required', 'exists:categories,id'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash', Rule::unique('products')->ignore($item)],
            'sku' => ['nullable', 'string', 'max:64', Rule::unique('products')->ignore($item)],
            'price' => ['required', 'integer', 'min:0'],
            'old_price' => ['nullable', 'integer', 'min:0'],
            'unit' => ['required', 'string', 'max:32'],
            'rating' => ['numeric', 'between:0,5'],
            'sold' => ['integer', 'min:0'],
            'stock' => ['integer', 'min:0'],
            'badge' => ['nullable', Rule::in(array_keys(Product::BADGES))],
            'images' => ['array', 'max:12'],
            'images.*' => ['string', 'max:255'],
            'short_description' => ['nullable', 'string', 'max:1000'],
            'description' => ['nullable', 'string', 'max:20000'],
            'specs' => ['array', 'max:50'],
            'specs.*.key' => ['required', 'string', 'max:120'],
            'specs.*.value' => ['required', 'string', 'max:255'],
            'calc' => ['nullable', 'array'],
            'calc.label' => ['nullable', 'string', 'max:120'],
            'calc.per_unit' => ['nullable', 'numeric', 'min:0'],
            'calc.hint' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'sort' => ['integer', 'min:0'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:500'],
            'bundle_ids' => ['array', 'max:5'],
            'bundle_ids.*' => ['integer', 'exists:products,id'],
        ];
    }

    protected function fill(Model $item, array $data): void
    {
        if (isset($data['calc']) && empty($data['calc']['per_unit'])) {
            $data['calc'] = null;
        }
        $item->fill(Arr::except($data, 'bundle_ids'))->save();
        if (array_key_exists('bundle_ids', $data)) {
            $ids = array_values(array_diff($data['bundle_ids'], [$item->id]));
            $item->bundle()->sync(collect($ids)->mapWithKeys(fn ($id, $i) => [$id => ['sort' => $i]])->all());
        }
    }

    protected function present(Model $item): array
    {
        /** @var Product $item */
        return array_merge($item->toArray(), [
            'images' => collect($item->images ?? [])->map(fn ($p) => ['path' => $p, 'url' => Frontend::storageUrl($p)])->all(),
            'specs' => array_values($item->specs ?? []),
            'bundle_ids' => $item->bundle->pluck('id')->all(),
            'discount' => $item->discountPercent(),
        ]);
    }
}
