<?php

namespace App\Http\Controllers\Admin;

use App\Models\Brand;
use App\Support\Frontend;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BrandController extends CrudController
{
    protected string $model = Brand::class;

    protected function query(Request $request): Builder
    {
        return Brand::query()->withCount('products')->orderBy('sort')->orderBy('name');
    }

    protected function rules(Request $request, ?Model $item): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:120', 'alpha_dash', Rule::unique('brands')->ignore($item)],
            'logo' => ['nullable', 'string', 'max:255'],
            'sort' => ['integer', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }

    protected function present(Model $item): array
    {
        return $item->toArray() + ['logo_url' => Frontend::storageUrl($item->logo)];
    }
}
