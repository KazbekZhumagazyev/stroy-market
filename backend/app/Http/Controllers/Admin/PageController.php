<?php

namespace App\Http\Controllers\Admin;

use App\Models\Page;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PageController extends CrudController
{
    protected string $model = Page::class;

    protected array $search = ['pages.title', 'pages.slug'];

    protected function query(Request $request): Builder
    {
        return Page::query()->orderBy('title');
    }

    protected function rules(Request $request, ?Model $item): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:120', 'alpha_dash', Rule::unique('pages')->ignore($item),
                Rule::notIn(['catalog', 'product', 'cart', 'favorites', 'blog', 'admin', 'api', 'account'])],
            'lead' => ['nullable', 'string', 'max:1000'],
            'sections' => ['array', 'max:30'],
            'sections.*.anchor' => ['nullable', 'string', 'max:60', 'alpha_dash'],
            'sections.*.title' => ['required', 'string', 'max:255'],
            'sections.*.body' => ['nullable', 'string', 'max:20000'],
            'is_published' => ['boolean'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:500'],
        ];
    }
}
