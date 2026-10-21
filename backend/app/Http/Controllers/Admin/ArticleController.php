<?php

namespace App\Http\Controllers\Admin;

use App\Models\Article;
use App\Support\Frontend;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ArticleController extends CrudController
{
    protected string $model = Article::class;

    protected array $search = ['articles.title', 'articles.tag'];

    protected array $with = ['category:id,name'];

    protected function query(Request $request): Builder
    {
        return Article::query()->with($this->with)->latest('published_at')->latest('id');
    }

    protected function rules(Request $request, ?Model $item): array
    {
        return [
            'category_id' => ['nullable', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash', Rule::unique('articles')->ignore($item)],
            'tag' => ['nullable', 'string', 'max:60'],
            'cover' => ['nullable', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string', 'max:1000'],
            'body' => ['nullable', 'string', 'max:100000'],
            'is_published' => ['boolean'],
            'published_at' => ['nullable', 'date'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:500'],
        ];
    }

    protected function present(Model $item): array
    {
        return $item->toArray() + ['cover_url' => Frontend::storageUrl($item->cover)];
    }
}
