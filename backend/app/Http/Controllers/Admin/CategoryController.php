<?php

namespace App\Http\Controllers\Admin;

use App\Models\Category;
use App\Support\Frontend;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CategoryController extends CrudController
{
    protected string $model = Category::class;

    protected function query(Request $request): Builder
    {
        return Category::query()->withCount('products')->orderBy('sort')->orderBy('name');
    }

    protected function rules(Request $request, ?Model $item): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:120', 'alpha_dash', Rule::unique('categories')->ignore($item)],
            'icon' => ['required', 'string', 'max:40'],
            'color' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'bg' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'image' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'sort' => ['integer', 'min:0'],
            'is_active' => ['boolean'],
            'show_in_menu' => ['boolean'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:500'],
        ];
    }

    protected function present(Model $item): array
    {
        return $item->toArray() + ['image_url' => Frontend::storageUrl($item->image)];
    }

    public function destroy(int $id)
    {
        $category = Category::withCount('products')->findOrFail($id);
        if ($category->products_count) {
            throw ValidationException::withMessages(['category' => "В категории {$category->products_count} товар(ов). Сначала перенесите или удалите их."]);
        }
        $category->delete();

        return ['ok' => true];
    }
}
