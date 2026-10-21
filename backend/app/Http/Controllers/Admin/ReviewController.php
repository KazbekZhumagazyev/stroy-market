<?php

namespace App\Http\Controllers\Admin;

use App\Models\Review;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class ReviewController extends CrudController
{
    protected string $model = Review::class;

    protected array $search = ['reviews.name', 'reviews.text', 'reviews.city'];

    protected array $with = ['product:id,name'];

    protected function query(Request $request): Builder
    {
        return Review::query()->with($this->with)->orderBy('sort')->latest('id');
    }

    protected function rules(Request $request, ?Model $item): array
    {
        return [
            'product_id' => ['nullable', 'exists:products,id'],
            'name' => ['required', 'string', 'max:120'],
            'city' => ['nullable', 'string', 'max:120'],
            'rating' => ['required', 'integer', 'between:1,5'],
            'text' => ['required', 'string', 'max:3000'],
            'is_published' => ['boolean'],
            'sort' => ['integer', 'min:0'],
        ];
    }
}
